<template>
    <MainLayout>
        <div>
            <h1 v-if="players.length > 0">{{ players[0].name }}'s Turn to Pick a Board Game</h1>
            <h1 v-else>I Couldn't Load The Data :(</h1>
            <button>Next Turn</button>
        </div>
    </MainLayout>
</template>
<script lang="ts">
import { ref, onBeforeMount } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import db from '../firebaseinit.js'
import { list } from 'postcss'

export default {
  name: 'BoardGame',
  components: {
    MainLayout
  },
  setup () {
    interface Player {
      id: string
      name: string
    }

    const players = ref<Player[]>([])
    const currentPlayerIndex = ref(0)

    // const currentPlayer = ref(players.value[currentPlayerIndex.value])

    // const nextTurn = () => {
    //   currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
    //   currentPlayer.value = players.value[currentPlayerIndex.value]
    // }
    onBeforeMount(() => {
      readPlayers()
    })

    const readPlayers = () => {
      db.collection('users')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((user) => {
            console.log(user.data())
            players.value.push({
              id: user.id,
              name: user.data().Name
            })
            console.log(user)
          })
        })
    }

    return {
      // currentPlayer,
      // nextTurn,
      players,
      readPlayers
    }
  }
}
</script>

  <style scoped>
    /* Add your CSS here */
  </style>
