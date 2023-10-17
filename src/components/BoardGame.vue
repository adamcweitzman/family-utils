<template>
    <MainLayout>
      <h2 style="text-decoration: underline;">Home</h2>
      <div class="row">
        <q-card class="col-12 col-md-6">
          <q-card-section>
            <div class="text-h6">Group Favorites</div>
          </q-card-section>

          <q-separator light inset />
          
          <q-card-section>
            <ol>
                <li><h6>{{gameIdToName[sortedGames[0]]}}</h6></li>
                <li><h6>{{gameIdToName[sortedGames[1]]}}</h6></li>
                <li><h6>{{gameIdToName[sortedGames[2]]}}</h6></li>
                <li><h6>{{gameIdToName[sortedGames[3]]}}</h6></li>
                <li><h6>{{gameIdToName[sortedGames[4]]}}</h6></li>
            </ol>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-md-6">
          <q-card-section>
            <div class="text-h6">Winning Percentages</div>
          </q-card-section>

          <q-separator light inset />

          <q-card-section>
            <div class="row">
              <ol>
                  <li v-for="player in players"
                    class="col-12 col-md-3"
                    :key="player.id">
                    <h6>{{player.name}} {{ Math.round(player.gamesWon / player.gamesPlayed * 100) }}%</h6>
                  </li>
              </ol>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="row">
        <q-card class="col-12">
          <q-card-section>
            <div class="text-h6">Turn</div>
          </q-card-section>

          <q-separator light inset />

          <q-card-section>
            <h5 v-if="players.length > 0"><span style="color: blue">{{ players[0].name }}'s</span> turn to pick a board game</h5>
            <h5 v-if="players.length > 0">{{ players[0].name }}'s favorite game is: <span style="color: red">{{ favoriteGame }}</span></h5>
          </q-card-section>
        </q-card>
      </div>
      <div class="row">
        <q-card class="col-12">
          <q-card-section>
            <div class="text-h6">Turn Order</div>
          </q-card-section>

          <q-separator light inset />
          <q-card-section>
            <ol >
              <li v-for="player in players" :key="player.id">{{ player.name }}</li>
            </ol>
          </q-card-section>
        </q-card>
      </div>
      <div class="row">
        <div class="q-pa-md">
          <h5 v-if="players.length > 0">Standings:</h5>
          <q-table v-if="players.length > 0"
            :rows="gameRows"
            :columns="tableColumns"
            :rows-per-page-options="[50, 100]"
            row-key="name"
            class="my-table">
          </q-table>
          <p v-else>Waiting for data...</p>

          <div id="q-app" style="min-height: 100vh;">
            <div class="q-pa-md"></div>
          </div>
        </div>
      </div>
    </MainLayout>
</template>
<script lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import db from '../firebaseinit.js'
import { useQuasar } from 'quasar'

export default {
  name: 'Home',
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
      players: Array<string>
    }
    let loaded = false
    const sortedGames = ref<string[]>([])
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

    const addGameWon = (id) => {
      for (const player of players.value) {
        if (player.id === id) {
          player.gamesWon++
        }
      }
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

    const addPlays = (play: Play) => {
      if(play.players != null) {
        players.value.forEach(player => {
          if(play.players.includes(player.id)) {
            player.gamesPlayed++
          }
        })
      } else {
        players.value.forEach(player => {
            player.gamesPlayed++
        })
      }
    }

    const SortGamesByNumberOfPlays = (plays) => {
      const gameFrequencyMap: { [key: string]: number } = {}
      for (const play of plays) {
        if (gameFrequencyMap[play.gameId]) {
          gameFrequencyMap[play.gameId]++
        } else {
          gameFrequencyMap[play.gameId] = 1
        }
      }

      sortedGames.value = Object.keys(gameFrequencyMap).sort((a, b) => gameFrequencyMap[b] - gameFrequencyMap[a])
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
              gameId: play.data().gameId,
              players: play.data().players
            })
          })
          const gameIdToCount: { [key: string] : number } = {}
          const gameIdToArrayIndex: { [key: string] : number } = {}
          const playerWins: any[][] = []
          SortGamesByNumberOfPlays(plays)
          console.log(sortedGames)
          plays.forEach((play) => {
            addPlays(play)
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
                  addGameWon('UyfZTqM1ZYqkAS31UPQ9')
                  break
                case "DsnaBf8FyLfsRbNw1txQ":
                  playerWins.push([gameIdToName[play.gameId], 0, 1, 0, 0])
                  addGameWon("DsnaBf8FyLfsRbNw1txQ")
                  break
                case "t9rCulN2SuSP7ynC0UQx":
                  playerWins.push([gameIdToName[play.gameId], 0, 0, 1, 0])
                  addGameWon("t9rCulN2SuSP7ynC0UQx")
                  break
                case "GnQ3MhXqB9WSr8LB5hm9":
                  playerWins.push([gameIdToName[play.gameId], 0, 0, 0, 1])
                  addGameWon("GnQ3MhXqB9WSr8LB5hm9")
                  break
                default:
                  break
              }
            } else {
              const gameIndex = gameIdToArrayIndex[play.gameId]
              switch (play.winnerId) {
                case 'UyfZTqM1ZYqkAS31UPQ9':
                  playerWins[gameIndex][1]++
                  addGameWon('UyfZTqM1ZYqkAS31UPQ9')
                  break
                case "DsnaBf8FyLfsRbNw1txQ":
                  playerWins[gameIndex][2]++
                  addGameWon("DsnaBf8FyLfsRbNw1txQ")
                  break
                case "t9rCulN2SuSP7ynC0UQx":
                  playerWins[gameIndex][3]++
                  addGameWon("t9rCulN2SuSP7ynC0UQx")
                  break
                case "GnQ3MhXqB9WSr8LB5hm9":
                  playerWins[gameIndex][4]++
                  addGameWon("GnQ3MhXqB9WSr8LB5hm9")
                  break
                default:
                  break
              }
            }
          })
          playerWins.forEach(game => {
            gameRows.value.push({ name: game[0], ashley: game[1], debbie: game[2], noah: game[3], adam: game[4] })
          })
          tableDataLoaded = true
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

      loaded = true
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
      sortedGames,
      gameIdToName,
      loaded,
      gameRows,
      gameRow: [
        { name: "Game 1", ashley: 0, noah: "0", adam: "1", debbie: "0" },
        { name: "Game 2", ashley: "0", noah: "0", adam: "1", debbie: "0" }
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
</script>

<style scoped>
  .content {
    justify-content: center;
  }
</style>
