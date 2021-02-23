<template>
  <v-app dark>
    <v-navigation-drawer
      v-if="!isSingleBookPage"
      v-model="drawer"
      fixed
      app
      temporary
      style="background-color: #13202a"
    >
      <side-menue />
    </v-navigation-drawer>
    <transition name="slide-top">
      <v-app-bar
        v-if="!isSingleBookPage"
        :clipped-left="true"
        fixed
        app
        color="#13202a"
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-toolbar-title v-text="title" />
        <v-spacer />
        <v-btn icon disabled>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </v-app-bar>
    </transition>

    <v-main> <nuxt /> </v-main>
    <transition name="fade">
      <v-btn
        v-if="isSingleBookPage"
        class="mt-4 ml-2"
        mid
        fab
        color="#13202a"
        fixed
        to="/"
      >
        <v-icon dark> mdi-arrow-left </v-icon>
      </v-btn>
    </transition>
    <v-navigation-drawer
      v-if="isSingleBookPage"
      v-model="fileListState"
      color="#13202a"
      right
      app
      :width="425"
      fixed
    >
      <playlist />
      <template #append>
        <div class="pa-2">
          <v-btn block @click.stop="fileListState = !fileListState">
            Schließen
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import Playlist from '../components/Playlist.vue'
import SideMenue from '../components/SideMenu'
export default {
  components: { SideMenue, Playlist },

  data() {
    return {
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      title: 'Franzible',
    }
  },
  computed: {
    fileListState: {
      get() {
        return this.$store.state.fileListState
      },
      set(value) {
        this.$store.commit('SET_FILE_LIST', value)
      },
    },
    isSingleBookPage() {
      return this.$nuxt.$route.name === 'books-id'
    },
  },
  methods: {},
}
</script>
<style scoped>
.slide-bottom-enter-active,
.slide-bottom-leave-active {
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}
.slide-bottom-enter,
.slide-bottom-leave-to {
  opacity: 0;
  transform: translate3d(0, 15px, 0);
}

.slide-top-enter-active,
.slide-top-leave-active {
  transition: transform 0.5s linear;
}
.slide-top-enter,
.slide-top-leave-to {
  transform: translate3d(-80, 0px, 0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
