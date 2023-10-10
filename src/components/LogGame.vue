<template>
  <MainLayout>
    <h2 style="text-decoration: underline;">Log Game</h2>
      <div v-if="tableDataLoaded" id="q-app" style="min-height: 100vh;">
          <div class="q-pa-md">
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
          </div>
      </div>
  </MainLayout>
</template>
<script lang="ts">
import { ref, onBeforeMount, computed, onUpdated, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import db from '../firebaseinit.js'
import { useQuasar } from 'quasar'
import { assertTSTypeParameterDeclaration } from '@babel/types'

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
    gamesPlayed: number
    gamesWon: number
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
  interface ValueLabel {
    value: string
    label: string
  }
  let loaded = false
  const sortedGames = ref<string[]>([])
  const gameIdToName: { [key: string]: string } = {}
  const playerIdToName: { [key: string]: string } = {}
  const players = ref<Player[]>([])
  const favoriteGame = ref<string>()
  const games = ref<Game[]>([])
  const $q = useQuasar()
  const name = ref(null)
  const age = ref(null)
  const accept = ref(true)
  const isLogging = ref(false)
  const winnerModel = ref<Select>()
  const gameModel = ref<Select>()
  const addGameModel = ref<string>()
  const chooserModel = ref<Select>()
  const gameOptions = ref<Select[]>([]);
  //const gamesRef: ValueLabel[] = ref([])
  const tab = ref('home')
  const gameRows = ref<any[]>([])
  let tableDataLoaded = ref(false)

  onMounted(() => {
    readPlayers()
    readGames()

    tableDataLoaded.value = true
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
            priority: user.data().Priority,
            gamesPlayed: 0,
            gamesWon: 0
          })
          if (!(user.id in playerIdToName)) {
            playerIdToName[user.id] = user.data().Name
          }
        })
        players.value.sort((a, b) => a.priority - b.priority)
      })
  }

  const resetForm = () => {
    gameModel.value = undefined
    chooserModel.value = undefined
    winnerModel.value = undefined
  }

  const resetGameInput = () => {
    addGameModel.value = undefined
  }

  const readGames = () => {
    db.collection('games')
      .get()
      .then((querySnapshot) => {
        gameOptions.value = []
        querySnapshot.forEach((game) => {
          gameOptions.value.push({
            value: game.id,
            label: game.data().Name
          })
          games.value.push({
            id: game.id,
            name: game.data().Name,
            designer: ''
          })
          if (!(game.id in gameIdToName)) {
            gameIdToName[game.id] = game.data().Name
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
    gamesRef: [],
    gameOptions,
    isFormIncomplete,
    gameModel,
    winnerModel,
    chooserModel,
    tab,
    favoriteGame,
    addGameModel,
    sortedGames,
    gameIdToName,
    loaded,
    gameRows,
    tableDataLoaded,
    gameRow: [
      { name: "Game 1", ashley: 0, noah: "0", adam: "1", debbie: "0" },
      { name: "Game 2", ashley: "0", noah: "0", adam: "1", debbie: "0" }
      // ... more game objects
    ],
    tableColumns: [
      { name: "Ashley", required: true, label: "game", align: "left", field: "name", sortable: true },
      { name: "Ashley", required: true, label: "ashley", align: "left", field: "ashley", sortable: true },
      { name: "Noah", required: true, label: "noah", align: "left", field: "noah", sortable: true },
      { name: "Adam", required: true, label: "adam", align: "left", field: "adam", sortable: true },
      { name: "Debbie", required: true, label: "debbie", align: "left", field: "debbie", sortable: true }
    ],
    playerOptions: [
      { value: 'GnQ3MhXqB9WSr8LB5hm9', label: 'Adam' },
      { value: 'DsnaBf8FyLfsRbNw1txQ', label: 'Debbie' },
      { value: 't9rCulN2SuSP7ynC0UQx', label: 'Noah' },
      { value: 'UyfZTqM1ZYqkAS31UPQ9', label: 'Ashley' }
    ],

    onSubmitGame () {
      console.log(addGameModel.value)
      db.collection('games').add({
        Name: addGameModel.value
      })
        .then(() => {
          console.log('read games')
          readGames()
          resetGameInput()
          $q.notify({
            color: 'positive',
            message: 'You logged a play successfully!',
            icon: 'cloud_done'
          })
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