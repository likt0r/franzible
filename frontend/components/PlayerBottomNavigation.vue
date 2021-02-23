<template>
  <v-bottom-navigation
    flat
    class="elevation-0 mt-4 justify-center"
    :height="bottomBarHeigth"
  >
    <v-dialog transition="dialog-bottom-transition" max-width="640">
      <template #activator="{ on, attrs }">
        <v-btn :width="bottomBarHeigth" v-bind="attrs" v-on="on">
          <span class="pa-2">Speed</span>
          <span class="pa-1">{{ (playerSpeed / 100).toFixed(2) }}x</span>
        </v-btn>
      </template>
      <template #default="dialog">
        <v-card>
          <v-toolbar color="#13202a" dark>Speed</v-toolbar>
          <v-card-text class="pt-16">
            <v-slider
              v-model="sliderValue"
              hint="Im a hint"
              max="200"
              min="50"
              thumb-label="always"
              :thumb-size="48"
              dense
              color="secondary"
            >
              <template #prepend>0.50x</template>
              <template #thumb-label="{ value }">
                {{ `${(value / 100).toFixed(2)}x` }}
              </template>
              <template #append>2.00x</template>
            </v-slider>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn @click="dialog.value = false" color="#13202a">Close</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>

    <v-btn :width="bottomBarHeigth" @click.stop="toggleFileList">
      <span class="pa-2">File</span>
      <v-icon>mdi-format-list-numbered-rtl</v-icon>
    </v-btn>
    <v-dialog transition="dialog-bottom-transition" max-width="320">
      <template #activator="{ on, attrs }">
        <v-btn :width="bottomBarHeigth" v-bind="attrs" v-on="on">
          <span class="pa-2">Sleep timer</span>
          <v-icon>mdi-timer-outline</v-icon>
        </v-btn>
      </template>
      <template #default="dialog">
        <v-card>
          <v-toolbar color="#13202a" dark>Sleep Timer</v-toolbar>
          <v-card-text>
            <v-btn-toggle v-model="btnToggleModel" class="pt-6">
              <v-btn
                v-for="timeValue in timerSelection"
                :key="timeValue"
                @click="startTimer(timeValue, dialog)"
                >{{
                  timeValue > -1 ? `${timeValue} Minuten` : 'Ende des Kapitels'
                }}</v-btn
              >
            </v-btn-toggle>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              v-if="timerActiveState"
              @click="stopTimer(dialog)"
              color="#13202a"
            >
              Cancel Timer
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="dialog.value = false" color="#13202a">Close</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-bottom-navigation>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'PlayerBottomNavigation',

  data() {
    return {
      timerSelection: [5, 10, 15, 30, 45, 60, -1],
      sliderValue: 100,
      btnToggleModel: null,
    }
  },
  computed: {
    playerSpeed() {
      return this.$store.getters['player/speed']
    },
    bottomBarHeigth() {
      return this.$vuetify.breakpoint.xs ? 60 : 80
    },
    timerActiveState() {
      return this.$store.getters['timer/getTimeActiveState']
    },
    timerCurrentTime() {
      return this.$store.getters['timer/getCurrentTime']
    },
  },
  watch: {
    sliderValue(value) {
      this.setSpeed(value)
    },
  },
  mounted() {
    this.sliderValue = this.playerSpeed
  },
  methods: {
    ...mapActions(['toggleFileList']),
    startTimer(time, dialog) {
      this.$store.dispatch('timer/startTimer', time)
      dialog.value = false
    },
    stopTimer(dialog) {
      this.$store.dispatch('timer/stopTimer')
      dialog.value = false
    },
    setSpeed(speed) {
      this.$store.dispatch('player/setSpeed', speed)
    },
  },
}
</script>

<style scoped>
.v-btn-toggle {
  flex-direction: column;
  width: 100%;
}
</style>
