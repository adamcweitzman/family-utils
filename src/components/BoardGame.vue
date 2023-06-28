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
                    <q-tab name="log" icon="add" label="Log Session"></q-tab>
                    <q-tab name="game" icon="casino" label="Add Game"></q-tab>
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
                        <h3 v-if="players.length > 0">{{ players[0].name }}'s favorite game is: {{ favoriteGame }}</h3>
                        <p v-else>Waiting for data...</p>
                        <div id="q-app" style="min-height: 100vh;">
                          <div class="q-pa-md">
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
                    <q-tab-panel name="game">
                      <div class="container">
                        <div class="q-pa-md" style="max-width: 400px">
                            <q-form
                                @submit="onSubmitGame"
                                @reset="onReset"
                                class="q-gutter-md"
                            >
                              <q-input filled v-model="addGameModel" label="Game name" />
                              <div>
                                <q-btn label="Submit" type="submit" color="primary"/>
                                </div>
                            </q-form>
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
      value: string
      label: string
    }
    interface Play {
      chooserId: string
      gameId: string
      winnerId: string
    }

    const players = ref<Player[]>([])
    const favoriteGame = ref<string>()
    const games = ref<Game[]>([])
    const plays: Play[] = []
    const $q = useQuasar()
    const name = ref(null)
    const age = ref(null)
    const accept = ref(true)
    const isLogging = ref(false)
    const winnerModel = ref<Select>()
    const gameModel = ref<Select>()
    const addGameModel = ref<string>()
    const chooserModel = ref<Select>()
    const gameOptions: Select[] = []
    const tab = ref('home')

    onBeforeMount(() => {
      readPlayers()
      readGames()
      readPlays()
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
            games.value.push({
              id: game.id,
              name: game.data().Name,
              designer: ''
            })
          })
        })
    }

    const readPlays = () => {
      db.collection('plays')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((play) => {
            plays.push({
              chooserId: play.data().chooserId,
              winnerId: play.data().winnerId,
              gameId: play.data().gameId
            })
          })
          const gameIdToCount: { [key: string] : number } = {}
          plays.forEach((play) => {
            if (play.chooserId === players.value[0].id) {
              if (!gameIdToCount[play.gameId]) {
                gameIdToCount[play.gameId] = 1
              } else {
                gameIdToCount[play.gameId]++
              }
            }
          })
          let highestValue = Number.MIN_SAFE_INTEGER
          let highestValueRecord = { key: '', value: 0 }
          for (const [key, value] of Object.entries(gameIdToCount)) {
            if (value > highestValue) {
              highestValue = value
              highestValueRecord = { key, value }
            }
          }

          games.value.forEach(game => {
            if (game.id === highestValueRecord.key) {
              favoriteGame.value = game.name
            }
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
      favoriteGame,
      addGameModel,
      playerOptions: [
        { value: 'GnQ3MhXqB9WSr8LB5hm9', label: 'Adam' },
        { value: 'DsnaBf8FyLfsRbNw1txQ', label: 'Debbie' },
        { value: 't9rCulN2SuSP7ynC0UQx', label: 'Noah' },
        { value: 'UyfZTqM1ZYqkAS31UPQ9', label: 'Ashley' }
      ],

      onSubmitGame () {
        console.log(addGameModel.value)
        gameOptions.forEach(x => {
          if (addGameModel.value === x.value) {
            throw new Error(`We already have a game named ${x.value}`)
          }
        })
        db.collection('games').add({
          Name: addGameModel.value
        })
      },
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
