<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar>
                <q-btn
                    flat
                    dense
                    round
                    icon="menu"
                    aria-label="Menu"
                    @click="toggleLeftDrawer"
                />

                <q-toolbar-title>
                    <a href="/" :style="{ color: 'inherit', textDecoration: 'inherit' }">
                        Weitzman Family Utilities
                    </a>
                </q-toolbar-title>

                <div>Version 1.0.0</div>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            bordered
        >
            <q-list>
                <q-item-label
                    header
                >
                    Apps
                </q-item-label>

                <EssentialLink
                    v-for="link in essentialLinks"
                    :key="link.title"
                    v-bind="link"
                />
            </q-list>
        </q-drawer>
        <div class="row">
            <div class="col">
                col
            </div>
            <div class="col-10">
                <q-page-container>
                    <slot></slot>
                </q-page-container>
            </div>
            <div class="col">
                col
            </div>
        </div>

        <q-footer elevated class="bg-grey-8 text-white">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                    </q-avatar>
                    <div><p>Made with &lt;3 By Adam</p></div>
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>
    </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import EssentialLink from '../components/EssentialLink.vue'
import { useRouter } from 'vue-router'

const linksList = [
  {
    title: 'Board Game Turn',
    caption: 'whose turn is it?',
    icon: 'casino',
    link: '/#/turn'
  },
  {
    title: 'Coffee Shop Rater',
    caption: 'this place is great!',
    icon: 'coffee',
    link: 'https://github.com/quasarframework'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const router = useRouter()
    const toolbarClickHandler = () => {
      router.push('/')
    }
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toolbarClickHandler,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})

// show-if-above  on q-drawer will have the toolbar open on big screens on load
</script>
