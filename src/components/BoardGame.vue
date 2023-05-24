<template>
    <MainLayout>
        <div>
            <h1>{{ currentPlayer }}'s Turn to Pick a Board Game</h1>
            <button @click="nextTurn">Next Turn</button>
        </div>
    </MainLayout>
</template>
<script>
import { ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'

export default {
  name: 'BoardGame',
  components: {
    MainLayout
  },
  setup () {
    const players = ref(['Noah', 'Adam', 'Ashley', 'Debbie']) // Adjust player list as required
    const currentPlayerIndex = ref(0)

    const currentPlayer = ref(players.value[currentPlayerIndex.value])

    const nextTurn = () => {
      currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
      currentPlayer.value = players.value[currentPlayerIndex.value]
    }

    return {
      currentPlayer,
      nextTurn
    }
  }
}
</script>

  <style scoped>
    /* Add your CSS here */
  </style>
