<template>
    <MainLayout>
        <div>
            <h1 v-if="players.length > 0">{{ players[0].name }}'s Turn to Pick a Board Game</h1>
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
                    <q-input
                      filled
                      v-model="name"
                      label="Your name *"
                      hint="Name and surname"
                      lazy-rules
                      :rules="[ val => val && val.length > 0 || 'Please type something']"
                    />
                    <q-input
                      filled
                      type="number"
                      v-model="age"
                      label="Your age *"
                      lazy-rules
                      :rules="[
                        val => val !== null && val !== '' || 'Please type your age',
                        val => val > 0 && val < 100 || 'Please type a real age'
                      ]"
                    />
                    <q-toggle v-model="accept" label="I accept the license and terms" />
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

    const players = ref<Player[]>([])
    const $q = useQuasar()
    const name = ref(null)
    const age = ref(null)
    const accept = ref(false)
    var isLogging = ref(false)

    onBeforeMount(() => {
      readPlayers()
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

    return {
      // currentPlayer,
      // nextTurn,
      name,
      age,
      accept,
      players,
      readPlayers,
      isLogging,
      logGame,

      onSubmit () {
        if (accept.value !== true) {
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'You need to accept the license and terms first'
          })
        } else {
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Submitted'
          })
        }
      },
      onReset () {
        name.value = null
        age.value = null
        accept.value = false
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
