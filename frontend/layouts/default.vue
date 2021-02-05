<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" fixed app temporary>
      <side-menue />
    </v-navigation-drawer>
    <v-app-bar :clipped-left="true" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title v-text="title" />
      <v-spacer />

      <v-btn icon disabled>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>

    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import SideMenue from '../components/SideMenu'
export default {
  components: { SideMenue },
  data() {
    return {
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      title: 'Franzible',
    }
  },
}
</script>
