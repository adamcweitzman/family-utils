<template>
  <MainLayout>
    <h2 style="text-decoration: underline;">Add New Game</h2>
    <div id="q-app" style="min-height: 100vh;">
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
    const winnerModel = ref<Select>()
    const gameModel = ref<Select>()
    const addGameModel = ref<string>()
    const chooserModel = ref<Select>()
    const gameOptions: Select[] = []
    const tab = ref('home')
    const gameRows = ref<any[]>([])

    onBeforeMount(() => {
      readGames()
    })

    const isFormIncomplete = computed(() => {
      return !chooserModel.value || !gameModel.value || !winnerModel.value
    })

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

    return {
      name,
      age,
      accept,
      players,
      readGames,
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
      onReset () {
        resetForm()
      }
    }
  }
}
</script>
