<template>
  <MainLayout>
    <h2 style="text-decoration: underline;" class="q-mb-md">Log Game</h2>
      <div v-if="tableDataLoaded" id="q-app" style="min-height: 100vh;">
          <div class="q-pa-md">
            <div>
                <div class="container">
                    <div class="q-pa-md" style="max-width: 400px">
                      <div class="q-mb-xl">
                        <!-- <q-card
                          class="my-card text-white"
                          style="background: radial-gradient(circle, black 0%, black 100%)"
                        >
                          <q-card-section>
                            <div class="text-h6">Story Of The Game</div>
                            <div class="text-subtitle2">by You</div>
                          </q-card-section> -->

                          <!-- <q-card-section class="q-pt-none"> -->
                            <!-- Dynamic Summary Text -->
                            <!-- <strong>On this fine day, 'twas </strong><p style="color: #26A69A; display: inline;">{{ chooserModel ? ` ${playerChecklistOptions.find(option => option.value === chooserModel?.value)?.label}` : ' ___' }}</p>
                            <br><strong>who did elect to engage in the noble contest of </strong><p style="color: #26A69A; display: inline;">{{ gameModel ? ` ${games.find(option => option.id === gameModel?.value)?.name}` : ' ___' }}</p>
                            <br><strong>wherein </strong><p style="color: #26A69A; display: inline;">{{ selectedPlayers && selectedPlayers.length > 0 ? 
                              `${selectedPlayers.map(playerId => {
                                const player = playerChecklistOptions.find(option => option.value === playerId);
                                return player ? player.label : playerId;
                              }).join(' and ')} ` : ' ___' }}</p>
                            <strong>were participants; and verily, </strong><p style="color: #26A69A; display: inline;">{{ winnerModel ? `${playerChecklistOptions.find(option => option.value === winnerModel?.value)?.label} ` : ' ___ ' }}</p><strong>stood as the undisputed victor when all was said and done</strong> -->
                          <!-- </q-card-section> -->
                        <!-- </q-card> -->

                      </div>
                      <q-form
                          @submit="onSubmit"
                          @reset="onReset"
                          class="q-gutter-md"
                      >
                        <q-select class="q-mb-md" outlined v-model="gameModel" :options="gameOptions" label="Game" />
                        <a  href="/#/AddNewBoardGame">Game not listed?</a>
                        <div>
                          <h5 class="q-mb-sm">Who Played?</h5>
                          <q-option-group
                            outlined
                            v-model="selectedPlayers"
                            :options="playerChecklistOptions"
                            type="checkbox"
                            label="Players Involved"
                          />
                          <div v-for="(player, index) in selectedPlayers" :key="player.id">
                            <label>{{ players.find(x => x.id == player)?.name }}'s Score: </label>
                            <input type="number" v-model="playerScores[index]">
                          </div>
                        </div>
                          
                          <q-select outlined v-model="winnerModel" :options="playerOptions" label="Winner"/>
                        <div>
                          <q-alert
                            v-if="isFormIncomplete"
                            type="negative"
                            dense
                            style="color: red"
                          >
                            Please complete all fields and select at least 2 players.
                          </q-alert>
                        </div>
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
import { MultiElo } from 'multi-elo'
import { ref, onBeforeMount, computed, onUpdated, onMounted } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import db from '../firebaseinit.js'
import { useQuasar } from 'quasar'
import { link } from 'fs'

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
    players: Array<string>
  }
  interface ValueLabel {
    value: string
    label: string
  }
  interface PlayerRanks {
    [key: string]: number; // key is the player ID, value is the rank
  }
  const selectedPlayers = ref<Player[]>([])
  const playerChecklistOptions = [
    { label: 'Adam', value: 'GnQ3MhXqB9WSr8LB5hm9' },
    { label: 'Debbie', value: 'DsnaBf8FyLfsRbNw1txQ' },
    { label: 'Noah', value: 't9rCulN2SuSP7ynC0UQx' },
    { label: 'Ashley', value: 'UyfZTqM1ZYqkAS31UPQ9' }
  ]
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
  const tab = ref('home')
  const gameRows = ref<any[]>([])
  let tableDataLoaded = ref(false)
  const playerScores = ref<number[]>([])

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
    return !gameModel.value || !winnerModel.value || (!selectedPlayers.value || selectedPlayers.value.length < 2)
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
        //selectedPlayers.value = players.value
      })
  }

  const resetForm = () => {
    gameModel.value = undefined
    chooserModel.value = undefined
    winnerModel.value = undefined
    selectedPlayers.value = []
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

  const updateElo = (players: Player[], gameId: string | undefined, winnerId: string | undefined) => {
    db.collection('elo')
      .where('gameId', '==', gameId)
      .get()
      .then(querySnapshot => {
        //calculate new ranks
        let idToRank : PlayerRanks = {}
        let newIdToRank : PlayerRanks = {}
        let ranks : number[] = []

        querySnapshot.forEach(elo => {
          if(players.includes(elo.data().playerId)) {
            idToRank[elo.data().playerId] = elo.data().rank
          }
        })

        for(let playerId in idToRank) {
          let rank = idToRank[playerId]
          if(playerId == winnerId) {
            ranks.unshift(rank)
          } else {
            ranks.push(rank)
          }
        }
        
        console.log('Old Ranks', ranks)

        let newRanks = MultiElo.getNewRatings(ranks)

        console.log('New Ranks', newRanks)

        // querySnapshot.forEach(elo => {
        //   if(players.includes(elo.data().playerId)) {
        //     var eloRef = db.collection("elo").doc(elo.data().id);
        //     eloRef.update({
        //       isCurrent: false,
        //       endTimestamp: new Date().getTime()
        //     })
        //     .then(() => {
        //       db.collection("elo").add({
        //         gameId: elo.data().gameId,
        //         playerId: elo.data().player.id,
        //         rank: 1200,
        //         isCurrent: true,
        //         startTimestamp: new Date().getTime(),
        //         endTimestamp: null
        //       })
        //     })
        //   }
        // })

        //loop through query snapshot 
          //if playerid is found in the players array
            //edit the record for is current false, and the end timestamp
            //add a new record for is current true
          

      });
  }

  return {
    playerScores,
    selectedPlayers,
    playerChecklistOptions,
    games,
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
        db.collection('plays').add({
          winnerId: winnerModel.value?.value,
          gameId: gameModel.value?.value,
          players: selectedPlayers.value,
          date: new Date(),
          dateTimestamp: new Date().getTime()
        })
        updateElo(players.value, gameModel.value?.value, winnerModel.value?.value)
        $q.notify({
          color: 'positive',
          message: 'You logged the game successfully!',
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