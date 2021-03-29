<template>
  <v-app-bar
    v-if="!isFindProgressPending && (lastBookId || bookId)"
    bottom
    fixed
    dark
    height="86"
    style="cursor: pointer"
    @click.stop="gotoBook()"
  >
    <v-avatar shrink>
      <offline-image
        :src="bookCoverUrl"
        :db-id="book && book.coverDbId"
        contain
      ></offline-image>
    </v-avatar>
    <div class="mid-column ml-2">
      <marquee-text
        class="font-weight-medium title"
        :repeat="1"
        :paused="true"
        >{{ title }}</marquee-text
      >
      <marquee-text
        class="font-weight-light subtitle"
        :repeat="1"
        :paused="true"
        >{{
          `${toMinutesAndSeconds(bookRemainingTime)} verbleibend`
        }}</marquee-text
      >
    </div>
    <v-btn icon shrink @click.stop="fastRewind">
      <v-icon class="" large>mdi-rewind-30</v-icon>
    </v-btn>
    <v-btn
      class="ml-0 mr-0"
      :loading="playerIsLoading"
      icon
      shrink
      @click.stop="playButtonClick"
    >
      <v-icon large>{{ playerIsPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import MarqueeText from 'vue-marquee-text-component'
import { makeFindMixin, makeGetMixin } from 'feathers-vuex'
import OfflineImage from './OfflineImage.vue'
import { getFullUrl } from '~/tools/url'
import { toMinutesAndSeconds } from '~/tools/formatTime'
export default {
  name: 'SmallPlayer',
  components: {
    MarqueeText,
    OfflineImage,
  },
  mixins: [
    makeFindMixin({ service: 'progress' }),
    makeGetMixin({
      service: 'books', // depending on service
      id() {
        return this.playerBookId || this.lastBookId
      },
    }),
  ],
  data() {
    return {}
  },
  computed: {
    title() {
      return `${this.book ? this.book.title : ''} | ${
        this.book ? this.book.author : ''
      }`
    },
    author() {
      return '53min 43s verbleibend'
    },
    progressParams() {
      return { query: {} } // Step 3
    },
    playerBookId() {
      return this.$store.getters['player/activeBookId']
    },
    lastProgress() {
      return this.progress && this.progress.length > 0
        ? [...this.progress]
            .filter((p) => p.played)
            .sort((a, b) =>
              Math.sign(Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
            )[0]
        : null
    },
    lastBookId() {
      return this.lastProgress ? this.lastProgress.bookId : null
    },
    playerIsPlaying() {
      return this.$store.getters['player/isPlaying']
    },

    bookCoverUrl() {
      return this.book && this.book.cover && this.book.cover[0]
        ? getFullUrl(this.book.cover[0])
        : '/icon.png'
    },

    bookDuration() {
      return this.book
        ? this.book.files.reduce((acc, file) => acc + file.duration, 0)
        : 0
    },
    tillChapter() {
      if (this.lastProgress && this.book) {
        let tillChapter = 0
        for (let i = 0; i < this.lastProgress.fileIndex; i++)
          tillChapter += this.book.files[i].duration
        return tillChapter
      } else {
        return 0
      }
    },
    bookRemainingTime() {
      return (
        this.bookDuration - this.tillChapter - this.lastProgress.filePosition
      )
    },
    playerIsLoading() {
      return this.activeBookId === this.bookId
        ? this.$store.getters['player/isLoading']
        : false
    },
  },

  watch: {
    book(newval) {
      // if player is empty load last played book into it
      if (newval && !this.playerBookId && this.lastProgress) {
        try {
          this.$store.dispatch('player/loadFile', {
            bookId: this.lastProgress.bookId,
            fileIndex: this.lastProgress.fileIndex,
            filePosition: this.lastProgress.filePosition,
            startPlaying: false,
          })
        } catch (error) {
          console.log('Error', error)
          this.$toast.error(error, {
            icon: 'alert-circle-outline',
          })
        }
      }
    },
  },
  methods: {
    gotoBook() {
      this.$router.push(`/books/${this.bookId}`)
    },
    toMinutesAndSeconds,
    getFullUrl,
    playButtonClick() {
      // if no bookId in player is set
      if (this.playerIsPlaying) {
        this.$store.dispatch('player/pause')
      } else {
        this.$store.dispatch('player/resume')
      }
    },
    fastRewind() {
      this.$store.dispatch('player/fastRewind')
    },
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
.mid-column {
  flex-grow: 1;
  overflow: hidden;
}
.title {
  font-size: 16px;
}
.subtitle {
  color: rgba(255, 255, 255, 0.7);
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
