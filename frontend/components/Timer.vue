<template>
  <div
    v-if="active"
    :class="`timer-display timer-display--${
      uiLandscape ? 'landscape' : 'portrait'
    } ma-4 mt-5`"
    @click="cancelDialog = true"
  >
    <v-hover>
      <v-chip
        slot-scope="{ hover }"
        :class="`elevation-${hover ? 5 : 2}`"
        v-ripple
        dark
        outlined
      >
        <v-avatar>
          <v-icon>mdi-av-timer</v-icon>
        </v-avatar>
        {{
          `${Math.floor(timer / 3600)}:${pad(
            Math.floor((timer % 3600) / 60),
            2
          )}:${pad(Math.floor((timer % 3600) % 60), 2)}`
        }}
      </v-chip>
    </v-hover>
    <v-dialog v-model="cancelDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Cancel Shutdown</v-card-title>

        <v-card-actions class="justify-end">
          <v-btn color="green darken-1" text @click="cancelDialog = false">
            Cancel
          </v-btn>

          <v-btn color="green darken-1" text @click="stopTimer()">
            Stop Timer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  components: {},
  data: function () {
    return {
      cancelDialog: false,
    }
  },
  computed: {
    ...mapState({
      uiLandscape: (state) => state.device.uiLandscape,
      timer: (state) => state.shutdown.timer,
      active: (state) => state.shutdown.active,
    }),
  },
  methods: {
    stopTimer() {
      this.$store.dispatch('shutdown/stopTimer')
      this.cancelDialog = !this.cancelDialog
    },
    pad(num, size) {
      return ('000000000' + num).substr(-size)
    },
  },
  async mounted() {
    const { data } = await this.$axios.get('/api/commands/shutdown')
    if (data.timer) {
      this.$store.dispatch('shutdown/initTimer', { seconds: data.timer })
    }
  },
}
</script>
<style scoped>
.timer-display {
  position: fixed;
  left: 0;
  z-index: 10;
}
.timer-display {
  position: fixed;
  left: 0;
  z-index: 10;
}
.timer-display--landscape {
  bottom: 0;
}
.timer-display--portrait {
  top: 0;
}
</style>
