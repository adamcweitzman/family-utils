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
                        <h5 v-if="players.length > 0"><span style="color: blue">{{ players[0].name }}'s</span> turn to pick a board game</h5>
                        <h5 v-if="players.length > 0">{{ players[0].name }}'s favorite game is: <span style="color: red">{{ favoriteGame }}</span></h5>
                        <h5 v-if="players.length > 0">Turn Order:</h5>
                        <ol >
                          <li v-for="player in players" :key="player.id">{{ player.name }}</li>
                        </ol>
                        <h5 v-if="players.length > 0">Standings:</h5>
                        <q-table v-if="players.length > 0"
                        :rows="gameRows"
                        :columns="tableColumns"
                        row-key="name"
                        class="my-table">
                        </q-table>
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
import { read } from 'fs'
import { Dictionary } from 'express-serve-static-core'

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
    interface TableGame {
      ashley: number,
      noah: number,
      debbie: number,
      adam: number
    }

    const gameIdToName: { [key: string]: string } = {}
    const playerIdToName: { [key: string]: string } = {}
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
    const gameRows = ref<any[]>([])
    let tableDataLoaded = false

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
            if (!(game.id in gameIdToName)) {
              gameIdToName[game.id] = game.data().Name
            }
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
          const gameIdToArrayIndex: { [key: string] : number } = {}
          const playerWins: any[][] = []
          plays.forEach((play) => {
            if (play.chooserId === players.value[0].id) {
              if (!gameIdToCount[play.gameId]) {
                gameIdToCount[play.gameId] = 1
              } else {
                gameIdToCount[play.gameId]++
              }
            }
            if (!(play.gameId in gameIdToArrayIndex)) {
              gameIdToArrayIndex[play.gameId] = playerWins.length
              switch (play.winnerId) {
                case 'UyfZTqM1ZYqkAS31UPQ9':
                  playerWins.push([gameIdToName[play.gameId], 1, 0, 0, 0])
                  break
                case "DsnaBf8FyLfsRbNw1txQ":
                  playerWins.push([gameIdToName[play.gameId], 0, 1, 0, 0])
                  break
                case "t9rCulN2SuSP7ynC0UQx":
                  playerWins.push([gameIdToName[play.gameId], 0, 0, 1, 0])
                  break
                default:
                  playerWins.push([gameIdToName[play.gameId], 0, 0, 0, 1])
                  break
              }
            } else {
              const gameIndex = gameIdToArrayIndex[play.gameId]
              switch (play.winnerId) {
                case 'UyfZTqM1ZYqkAS31UPQ9':
                  playerWins[gameIndex][1]++
                  break
                case "DsnaBf8FyLfsRbNw1txQ":
                  playerWins[gameIndex][2]++
                  break
                case "t9rCulN2SuSP7ynC0UQx":
                  playerWins[gameIndex][3]++
                  break
                default:
                  playerWins[gameIndex][4]++
                  break
              }
            }
            // populate the data table
            // save the index of the game array in a dictionary if it doesn't exist in the dictionary
            // save player id to spot in array with a dictionary { ashley 1, noah 2, debbie 3, adam 4}
            // first lookup index of session if exists in dict
            // lookup the winner id in the dict and ++ the spot in the array
            // else
            // add to the dictionary the array.length - 1
            // add new row to the dictionary
          })
          playerWins.forEach(game => {
            gameRows.value.push({ name: game[0], ashley: game[1], debbie: game[2], noah: game[3], adam: game[4] })
          })
          console.log(gameRows)
          tableDataLoaded = true
          console.log(tableDataLoaded)
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
      gameRows,
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
        gameOptions.forEach(x => {
          if (addGameModel.value === x.value) {
            throw new Error(`We already have a game named ${x.value}`)
          }
        })
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
