<template>
  <v-app-bar bottom fixed dark height="86">
    <v-avatar shrink>
      <v-img src="/icon.png" contain></v-img>
    </v-avatar>
    <v-row grow>Page title</v-row>

    <v-spacer></v-spacer>
    <v-btn icon shrink>
      <v-icon large>mdi-rewind-30</v-icon>
    </v-btn>
    <v-btn icon shrink>
      <v-icon large>mdi-play</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import MarqueeText from 'vue-marquee-text-component'
import { getFullUrl } from '../tools/url'
import { toMinutesAndSeconds } from '../tools/formatTime'
export default {
  data() {
    return {}
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    activeBookId() {
      return this.$store.getters['player/activeBookId']
    },
    activeFileIndex() {
      return this.activeBookId === this.id
        ? this.$store.getters['player/activeFileIndex']
        : null
    },
  },
  methods: {
    playFile(index) {
      this.$store.dispatch('player/playFile', {
        bookId: this.id,
        fileIndex: index,
      })
    },
    toMinutesAndSeconds,
    getFullUrl,
  },
}
</script>

<style scoped>
.app-bar {
  background-color: #13202a !important;
}
.v-avatar {
  height: 100% !important;
  width: 72px !important;
  min-width: 80px !important;
  border-radius: unset;
}
/deep/ .v-toolbar__title {
  background-color: red !important;
  flex-grow: 1;
  width: 100%;
  height: 100%;
}
/deep/ .v-toolbar__content {
  padding-left: 4px;
  padding-top: 4px;
  padding-bottom: 4px;
  justify-content: space-between;
}
</style>
