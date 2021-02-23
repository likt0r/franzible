<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      temporary
      style="background-color: #13202a"
    >
      <side-menue />
    </v-navigation-drawer>
    <v-app-bar :clipped-left="true" fixed app color="#13202a">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon disabled>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main> <nuxt /> </v-main
  ></v-app>
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
