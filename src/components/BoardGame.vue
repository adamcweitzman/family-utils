<template>
    <MainLayout>
        <div>
            <h1 v-if="players.length > 0">{{ players[0].name }}'s turn to pick a board game</h1>
            <p v-else>Waiting for data...</p>
            <div class="container">
                <div class="content">
                    <q-btn v-if="!isLogging" color="primary" label="Log Game" @click="logGame" />
                </div>
                <div v-if="isLogging" class="q-pa-md" style="max-width: 400px">
                    <q-form
                        @submit="onSubmit"
                        @reset="onReset"
                        class="q-gutter-md"
                    >
                        <q-select outlined v-model="gameModel" :options="gameOptions" label="Game" />
                        <q-select outlined v-model="winnerModel" :options="playerOptions" label="Winner"/>
                        <div>
                            <q-btn label="Submit" type="submit" color="primary"/>
                            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
                        </div>
                    </q-form>
                </div>
            </div>
        </div>
    </MainLayout>
</template>
<script lang="ts">
import { ref, onBeforeMount } from 'vue'
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

    onBeforeMount(() => {
      readPlayers()
      readGames()
    })

    const logGame = () => {
      isLogging.value = true
    }

    const readPlayers = () => {
      db.collection('users')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((user) => {
            console.log(user.data())
            players.value.push({
              id: user.id,
              name: user.data().Name,
              priority: user.data().Priority
            })
            console.log(user)
          })
          players.value.sort((a, b) => a.priority - b.priority)
        })
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
            console.log(gameOptions[0])
          })
        })
    }

    return {
      // currentPlayer,
      // nextTurn,
      name,
      age,
      accept,
      players,
      readPlayers,
      readGames,
      isLogging,
      logGame,
      gameOptions,

      form: {
        winner: null,
        chooser: null,
        game: ''
      },

      gameModel,
      winnerModel,
      chooserModel,
      playerOptions: [
        { value: "GnQ3MhXqB9WSr8LB5hm9", label: 'Adam' },
        { value: "DsnaBf8FyLfsRbNw1txQ", label: 'Debbie' },
        { value: "t9rCulN2SuSP7ynC0UQx", label: 'Noah' },
        { value: "UyfZTqM1ZYqkAS31UPQ9", label: 'Ashley' }
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
          db.collection('plays').add({
            chooserId: players.value[0].id,
            winnerId: winnerModel.value?.value,
            gameId: gameModel.value?.value
          })
          players.value.forEach(player => {
            if (player.priority === 1) {
              player.priority = players.value.length
            } else {
              player.priority--
            }
            const userRef = db.collection('users').doc(player.id)
            userRef.set({
              Priority: player.priority
            }, { merge: true })
          })
          readPlayers()
          $q.notify({
            color: 'positive',
            message: 'You logged a play successfully!',
            icon: 'cloud_done'
          })
        } catch (error) {
          console.error("Error adding document: ", error)
          $q.notify({
            color: 'negative',
            message: `Error adding document: ${error}`
          })
        }
      },
      onReset () {
        name.value = null
        age.value = null
        accept.value = false
        // winnerModel.value = null
        // gameModel.value = null
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
