<template>
    <MainLayout>
        <div>
            <h1>{{ players[0] }}'s Turn to Pick a Board Game</h1>
            <button>Next Turn</button>
        </div>
    </MainLayout>
</template>
<script>
import { ref, onBeforeMount } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import db from '../firebaseinit.js'

export default {
  name: 'BoardGame',
  components: {
    MainLayout
  },
  setup () {
    const players = ref([])
    // const currentPlayerIndex = ref(0)

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
            players.value.push({
              id: user.id,
              name: user.data().name
            })
            console.log(players)
          })
        })
    }

    return {
      // currentPlayer,
      // nextTurn,
      readPlayers
    }
  }
}
</script>

  <style scoped>
    /* Add your CSS here */
  </style>
