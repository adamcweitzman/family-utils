<template>
    <MainLayout>
        <div id="q-app" style="min-height: 100vh;">
            <div class="q-pa-md">

                <q-tabs
                    v-model="tab"
                    no-caps
                    inline-label
                    class="bg-purple text-white shadow-2"
                >
                    <q-tab name="home" icon="mail" label="Dashboard"></q-tab>
                    <q-tab name="log" icon="add" label="Log Game"></q-tab>
                </q-tabs>
                <q-tab-panels
                    v-model="tab"
                    animated
                    swipeable
                    transition-prev="jump-up"
                    transition-next="jump-up"
                >

                    <q-tab-panel name="home">
                        <h3 v-if="players.length > 0">{{ players[0].name }}'s turn to pick a board game</h3>
                        <p v-else>Waiting for data...</p>
                        <div id="q-app" style="min-height: 100vh;">
                          <div class="q-pa-md">
                            <q-table
                              title="Treats"
                              :rows="rows"
                              :columns="columns"
                              row-key="name"
                            ></q-table>
                          </div>
                        </div>
                    </q-tab-panel>

                    <q-tab-panel name="log">
                        <div>
                            <div class="container">
                                <div class="q-pa-md" style="max-width: 400px">
                                    <q-form
                                        @submit="onSubmit"
                                        @reset="onReset"
                                        class="q-gutter-md"
                                    >
                                        <q-select outlined v-model="chooserModel" :options="playerOptions" label="Chosen By" />
                                        <q-select outlined v-model="gameModel" :options="gameOptions" label="Game" />
                                        <q-select outlined v-model="winnerModel" :options="playerOptions" label="Winner"/>
                                        <div>
                                            <q-btn :disabled="isFormIncomplete" label="Submit" type="submit" color="primary"/>
                                            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
                                        </div>
                                    </q-form>
                                </div>
                            </div>
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </div>
        </div>
    </MainLayout>
</template>
<script lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import db from '../firebaseinit.js'
import { list } from 'postcss'
import { useQuasar } from 'quasar'

export default {
  name: 'BoardGame',
  components: {
    MainLayout
  },
  setup () {
    interface Player {
      id: string
      name: string
      priority: number
    }
    interface Game {
      id: string
      name: string
      designer: string
    }
    interface Select {
      value: string,
      label: string
    }

    const columns = [
      {
        name: 'name',
        required: true,
        label: 'Dessert (100g serving)',
        align: 'left',
        field: row => row.name,
        format: val => `${val}`,
        sortable: true
      },
      { name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true },
      { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
      { name: 'carbs', label: 'Carbs (g)', field: 'carbs' },
      { name: 'protein', label: 'Protein (g)', field: 'protein' },
      { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
      { name: 'calcium', label: 'Calcium (%)', field: 'calcium', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
      { name: 'iron', label: 'Iron (%)', field: 'iron', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
    ]

    const rows = [
      {
        name: 'Frozen Yogurt',
        calories: 159,
        fat: 6.0,
        carbs: 24,
        protein: 4.0,
        sodium: 87,
        calcium: '14%',
        iron: '1%'
      },
      {
        name: 'Ice cream sandwich',
        calories: 237,
        fat: 9.0,
        carbs: 37,
        protein: 4.3,
        sodium: 129,
        calcium: '8%',
        iron: '1%'
      },
      {
        name: 'Eclair',
        calories: 262,
        fat: 16.0,
        carbs: 23,
        protein: 6.0,
        sodium: 337,
        calcium: '6%',
        iron: '7%'
      },
      {
        name: 'Cupcake',
        calories: 305,
        fat: 3.7,
        carbs: 67,
        protein: 4.3,
        sodium: 413,
        calcium: '3%',
        iron: '8%'
      },
      {
        name: 'Gingerbread',
        calories: 356,
        fat: 16.0,
        carbs: 49,
        protein: 3.9,
        sodium: 327,
        calcium: '7%',
        iron: '16%'
      },
      {
        name: 'Jelly bean',
        calories: 375,
        fat: 0.0,
        carbs: 94,
        protein: 0.0,
        sodium: 50,
        calcium: '0%',
        iron: '0%'
      },
      {
        name: 'Lollipop',
        calories: 392,
        fat: 0.2,
        carbs: 98,
        protein: 0,
        sodium: 38,
        calcium: '0%',
        iron: '2%'
      },
      {
        name: 'Honeycomb',
        calories: 408,
        fat: 3.2,
        carbs: 87,
        protein: 6.5,
        sodium: 562,
        calcium: '0%',
        iron: '45%'
      },
      {
        name: 'Donut',
        calories: 452,
        fat: 25.0,
        carbs: 51,
        protein: 4.9,
        sodium: 326,
        calcium: '2%',
        iron: '22%'
      },
      {
        name: 'KitKat',
        calories: 518,
        fat: 26.0,
        carbs: 65,
        protein: 7,
        sodium: 54,
        calcium: '12%',
        iron: '6%'
      }
    ]

    const players = ref<Player[]>([])
    const games = ref<Game[]>([])
    const $q = useQuasar()
    const name = ref(null)
    const age = ref(null)
    const accept = ref(true)
    const isLogging = ref(false)
    const winnerModel = ref<Select>()
    const gameModel = ref<Select>()
    const chooserModel = ref<Select>()
    const gameOptions: Select[] = []
    const tab = ref('home')

    onBeforeMount(() => {
      readPlayers()
      readGames()
    })

    const logGame = () => {
      isLogging.value = true
    }

    const updatePlayerPriority = (player: Player) => {
      const userRef = db.collection('users').doc(player.id)
      userRef.set({
        Name: player.name,
        Priority: player.priority
      }, { merge: true })
    }

    const isFormIncomplete = computed(() => {
      return !chooserModel.value || !gameModel.value || !winnerModel.value
    })

    const readPlayers = () => {
      db.collection('users')
        .get()
        .then((querySnapshot) => {
          players.value = []
          querySnapshot.forEach((user) => {
            players.value.push({
              id: user.id,
              name: user.data().Name,
              priority: user.data().Priority
            })
          })
          players.value.sort((a, b) => a.priority - b.priority)
        })
    }

    const resetForm = () => {
      gameModel.value = undefined
      chooserModel.value = undefined
      winnerModel.value = undefined
    }

    const readGames = () => {
      db.collection('games')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((game) => {
            gameOptions.push({
              value: game.id,
              label: game.data().Name
            })
          })
        })
    }

    return {
      name,
      age,
      accept,
      players,
      readPlayers,
      readGames,
      isLogging,
      logGame,
      gameOptions,
      isFormIncomplete,
      gameModel,
      winnerModel,
      chooserModel,
      tab,
      columns,
      rows,
      playerOptions: [
        { value: 'GnQ3MhXqB9WSr8LB5hm9', label: 'Adam' },
        { value: 'DsnaBf8FyLfsRbNw1txQ', label: 'Debbie' },
        { value: 't9rCulN2SuSP7ynC0UQx', label: 'Noah' },
        { value: 'UyfZTqM1ZYqkAS31UPQ9', label: 'Ashley' }
      ],

      onSubmit () {
        if (accept.value !== true) {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'You need to accept the license and terms first'
          })
        }
        try {
          const chooserId = chooserModel.value?.value
          const chooserPriority = players.value.find(x => x.id === chooserId)?.priority

          if (!chooserPriority) {
            throw new Error('chooser priority is undefined')
          }

          const playerTurnId = players.value[0].id

          db.collection('plays').add({
            chooserId,
            winnerId: winnerModel.value?.value,
            gameId: gameModel.value?.value
          })
          if (chooserId !== playerTurnId) {
            players.value.forEach(player => {
              if (player.id === playerTurnId) {
                return
              } else if (player.id === chooserId) {
                player.priority = players.value.length
              } else if (player.priority > chooserPriority) {
                player.priority--
              }
              updatePlayerPriority(player)
            })
          } else {
            players.value.forEach(player => {
              if (player.priority === 1) {
                player.priority = players.value.length
              } else {
                player.priority--
              }
              updatePlayerPriority(player)
            })
          }
          $q.notify({
            color: 'positive',
            message: 'You logged a play successfully!',
            icon: 'cloud_done'
          })
          readPlayers()
          resetForm()
        } catch (error) {
          $q.notify({
            color: 'negative',
            message: `Error adding document: ${error}`
          })
        }
      },
      onReset () {
        resetForm()
      }
    }
  }
}
//  TODO: 1) submit game to db, 2) display logged games in table, 3) rev the player priority
</script>

  <style scoped>
    .content {
      justify-content: center;
    }
  </style>
