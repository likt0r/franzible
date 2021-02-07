<template>
  <v-container v-if="book">
    <v-row justify="center" class="pt-0">
      <v-col xs="12" sm="10" md="8" lg="6" class="pa-0">
        <v-card v-if="book" class="mx-auto">
          <v-card-text>
            <v-img :src="getFullUrl(book.cover)" :aspect-ratio="4 / 4"> </v-img>
          </v-card-text>
          <v-card-subtitle class="pb-4 text-center">
            {{ book.files[activeFileIndex].filename }}
          </v-card-subtitle>
          <v-card-text
            ><v-slider
              v-model="sliderPosition"
              :max="fileDuration"
              min="0"
              @mousedown="sliederIsTouched = true"
              @mouseup="sliederIsTouched = false"
              @change="seek"
            ></v-slider>
          </v-card-text>
          <v-card-text class="pt-0">
            <v-row class="pt-0">
              <v-col class="text-left" :cols="3">{{
                toMinutesAndSeconds(filePositionInSecs)
              }}</v-col>

              <v-col class="text-center" :cols="6"
                >Restzeit des Hörspiels</v-col
              >

              <v-col class="text-right" :cols="3"
                >-{{ toMinutesAndSeconds(fileRemainingTime) }}</v-col
              >
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn fab medium dark @click.stop="skipPrevious">
              <v-icon medium>mdi-skip-previous-outline</v-icon>
            </v-btn>

            <v-btn fab medium dark @click.stop="fastRewind">
              <v-icon medium>mdi-rewind-30</v-icon>
            </v-btn>

            <v-btn
              fab
              x-large
              dark
              :loading="playerIsLoading"
              @click="playButtonClick"
            >
              <v-icon medium>{{
                playerIsPlaying
                  ? 'mdi-pause-circle-outline'
                  : 'mdi-play-circle-outline'
              }}</v-icon>
            </v-btn>

            <v-btn fab medium dark @click.stop="fastForward">
              <v-icon medium>mdi-fast-forward-30</v-icon>
            </v-btn>

            <v-btn fab medium dark @click.stop="skipNext">
              <v-icon medium>mdi-skip-next-outline</v-icon>
            </v-btn>

            <v-spacer></v-spacer>
          </v-card-actions>

          <v-toolbar flat class="elevation-0 mt-4">
            <v-btn>
              <span class="pa-2">Speed</span>
              <span class="pa-1">1.00X</span>
            </v-btn>

            <v-btn @click.stop="toggleFileList">
              <span class="pa-2">File</span>
              <v-icon>mdi-format-list-numbered-rtl</v-icon>
            </v-btn>

            <v-btn>
              <span class="pa-2">Sleep timer</span>

              <v-icon>mdi-timer-outline</v-icon>
            </v-btn>
          </v-toolbar>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="space-around"> </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { toMinutesAndSeconds } from '../../tools/formatTime'
import { getFullUrl } from '../../tools/url'
export default {
  name: 'Player',
  layout: 'single',
  async asyncData({ params, store }) {
    const response = await store.dispatch('progress/find', {
      query: { bookId: params.id },
    })
    if (response.total === 0) {
      await store.dispatch('progress/create', {
        bookId: params.id,
        fileIndex: 0,
        position: 0,
      })
    }
    const progress =
      response.total === 0
        ? {
            bookId: params.id,
            fileIndex: 0,
            filePosition: 0,
          }
        : response.data[0]

    console.log(progress)
    let book = await store.getters['books/get'](params.id)
    if (!book) book = await store.dispatch('books/get', params.id)
    console.log('book', book)
    return { progress, book }
  },

  data() {
    return {
      sliderPosition: 0,
      sliederIsTouched: false,
    }
  },
  computed: {
    ...mapGetters(['fileListState']),
    activeBookId() {
      return this.$store.getters['player/activeBookId']
    },
    activeFileIndex() {
      return this.activeBookId === this.id
        ? this.$store.getters['player/activeFileIndex']
        : 0
    },
    playerIsLoading() {
      return this.activeBookId === this.id
        ? this.$store.getters['player/isLoading']
        : false
    },
    playerIsPlaying() {
      return this.activeBookId === this.id
        ? this.$store.getters['player/isPlaying']
        : false
    },
    filePositionInSecs() {
      return this.activeBookId === this.id
        ? this.$store.getters['player/filePositionInSecs']
        : this.progress.filePosition
    },
    fileDuration() {
      return this.activeBookId === this.id
        ? this.$store.getters['player/fileDuration']
        : this.book.files[this.progress.fileIndex].duration
    },
    fileRemainingTime() {
      return this.activeBookId === this.id
        ? this.$store.getters['player/fileRemainingTime']
        : this.fileDuration
    },
    id() {
      return this.$route.params.id
    },
  },
  watch: {
    filePositionInSecs(value) {
      if (!this.sliederIsTouched) {
        this.sliderPosition = value
      }
    },
    sliderPosition(value) {
      if (this.sliederIsTouched) {
        this.seek(value)
      }
    },
  },
  mounted() {
    // initlaise slider position
    this.sliderPosition = this.progress.filePosition
  },
  methods: {
    ...mapActions(['toggleFileList']),
    doSomething() {
      console.log('done')
      console.log('done')
    },
    playButtonClick() {
      if (this.activeBookId !== this.id) {
        this.$store.dispatch('player/playFile', {
          bookId: this.id,
          fileIndex: this.progress.fileIndex,
          filePosition: this.progress.filePosition,
        })
      } else if (this.playerIsPlaying) {
        this.$store.dispatch('player/pause')
      } else {
        this.$store.dispatch('player/resume')
      }
    },
    seek(position) {
      this.$store.dispatch('player/seek', position)
    },
    skipNext() {
      this.$store.dispatch('player/skipNext')
    },
    skipPrevious() {
      this.$store.dispatch('player/skipPrevious')
    },
    fastForward() {
      this.$store.dispatch('player/fastForward')
    },
    fastRewind() {
      this.$store.dispatch('player/fastRewind')
    },
    getFullUrl,
    toMinutesAndSeconds,
  },
}
</script>
