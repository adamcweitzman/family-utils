<template>
  <MainLayout>
    <h2 style="text-decoration: underline;">History</h2>
    <div class="row q-mb-lg" v-if="pageLoaded" v-for="play in plays" :key="play.id">
      <q-card class="col-12 col-md-6">
        <q-card-section>
          <div class="row items-center">
            <div class="text-h6 col-11 vertical-middle">{{ games.find(x => x.id == play.gameId)?.name }} - {{ new Date(play.timestamp).toLocaleDateString() }}</div>
            <div class="col-1"><q-btn class="glossy" round color="primary" @click="deleteGame(play)" icon="close"/></div>
          </div>

        </q-card-section>

        <q-separator light inset />
        
        <q-card-section>
          <h5>Winner: {{ players.find(x => play.winnerId == x.id)?.name }}</h5>
          <h5>Chooser: {{ players.find(x => play.chooserId == x.id)?.name }}</h5>
        </q-card-section>
      </q-card>
    </div>
  </MainLayout>
</template>

<script lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import db from '../firebaseinit.js'
import EloRank from 'elo-rank'
import { date } from 'quasar'
import { useQuasar } from 'quasar'
export default {
  name: 'History',
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
      winningPercentage: number
    }
    interface Play {
      id: string
      chooserId: string
      gameId: string
      winnerId: string
      players: Array<string>
      timestamp: number,
      date: Date
    }
    interface Game {
      id: string
      name: string
      designer: string
    }
    interface Elo {
      id: string
      playerId: string
      gameId: string
      rank: number
    }
    let plays = ref<Play[]>([])
    let games = ref<Game[]>([])
    let players = ref<Player[]>([])
    let pageLoaded = ref<boolean>(false)
    const $q = useQuasar()
    const deleteGame = (play: any) => {
      console.log(play)
      db.collection("plays").doc(play.id).delete().then(() => {
        plays.value = plays.value.filter(item => play.id !== item.id);
        $q.notify({
          color: 'positive',
          message: 'You delete the game successfully!',
          icon: 'delete'
        })
      }).catch((error) => {
          console.error("Error removing document: ", error);
      });
    }
    const readGames = () => {
      db.collection('games')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((game) => {
            games.value.push({
              id: game.id,
              name: game.data().Name,
              designer: ''
            })
          })
        })
    }
    const readPlayers = () => {
      db.collection('users')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((user) => {
            players.value.push({
              id: user.id,
              name: user.data().Name,
              priority: user.data().Priority,
              gamesPlayed: 0,
              gamesWon: 0,
              winningPercentage: 0
            })
          })
          players.value.sort((a, b) => a.winningPercentage - b.winningPercentage)
        })
    }
    const readPlays = () => {
      db.collection('plays')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((play) => {
            console.log(play.id)
            plays.value.push({
              chooserId: play.data().chooserId,
              winnerId: play.data().winnerId,
              gameId: play.data().gameId,
              players: play.data().players,
              date: play.data().date,
              timestamp: setDate(play.data().dateTimestamp, play.data().date),
              id: play.id
            })
          })
          plays.value.sort((eventA, eventB) => {
            // Convert the dates to timestamps, treating null as the largest possible number
            let timeA = eventA;
            let timeB = eventB;

            return eventB.timestamp - eventA.timestamp;
          });
          
          console.log(plays)
        })
    }
    const setDate = (dateTimestamp: any, date: any) => {
      //this is to handle dates in ios that can't deal with a date object coming fromb firebase so saving the date now as dateTimestamp which is a number
      if(dateTimestamp == undefined) {
        if(date == undefined) {
          return new Date("01/01/1900").getTime()
        } else {
          return new Date(date.seconds*1000).getTime()
        }
      } else {
        return dateTimestamp
      } 
    }
    const setLoaded = () => {
      pageLoaded.value = true;
    }
    onBeforeMount(() => {
      readPlayers()
      readGames()
      readPlays()
      setLoaded()
    })
    return {
      plays,
      games,
      players,
      pageLoaded,
      deleteGame,
      playerIdToName: [
          { value: 'GnQ3MhXqB9WSr8LB5hm9', label: 'Adam' },
          { value: 'DsnaBf8FyLfsRbNw1txQ', label: 'Debbie' },
          { value: 't9rCulN2SuSP7ynC0UQx', label: 'Noah' },
          { value: 'UyfZTqM1ZYqkAS31UPQ9', label: 'Ashley' }
        ],
    }
  }

}
</script>
