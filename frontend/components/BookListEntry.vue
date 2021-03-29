<template>
  <v-list-item>
    <v-list-item-avatar tile @click.stop="toggleDownload">
      <offline-image
        :alt="`${book.title} cover image`"
        :src="getFullUrl(this.book.cover)"
        :dbId="this.book && book.coverDbId"
      >
        <v-progress-circular
          v-if="isBookDownloading(book._id)"
          :rotate="-90"
          :size="70"
          :width="10"
          :value="getBookDownloadProgress(book._id)"
          color="secondary"
        >
          {{ getBookDownloadProgress(book._id) }}
        </v-progress-circular>

        <v-icon small v-else>{{
          isBookDownloaded(book._id) ? 'mdi-delete' : 'mdi-download'
        }}</v-icon>
      </offline-image>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title v-if="book.series.length > 0"
        ><v-chip
          v-for="serie in book.series"
          :key="serie"
          class="mr-2"
          color="#13202a"
          small
        >
          {{ serie }}
        </v-chip></v-list-item-title
      >
      <v-list-item-title v-text="book.title"></v-list-item-title>
      <v-list-item-subtitle v-text="book.author"></v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action>
      <v-btn icon :to="`/books/${book._id}`">
        <v-icon color="secondary">mdi-play</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script>
import { mapGetters } from 'vuex'
import OfflineImage from './OfflineImage.vue'
import { getFullUrl } from '~/tools/url'
import { getDatabase } from '~/tools/database'
export default {
  components: { OfflineImage },
  props: {
    book: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      coverUrl: '/icon.png',
    }
  },

  computed: {
    ...mapGetters({
      isBookDownloaded: 'offline/isBookDownloaded',
      getOfflineBook: 'offline/getBook',
      getBookDownloadProgress: 'offline/getBookDownloadProgress',
      isBookDownloading: 'offline/isBookDownloading',
    }),
  },

  methods: {
    getFullUrl,

    toggleDownload() {
      console.log('Book clicked ', this.isBookDownloaded(this.book._id))

      if (this.isBookDownloaded(this.book._id)) {
        console.log('offline/deleteBook')
        this.$store.dispatch('offline/deleteBook', this.book._id)
      } else {
        console.log('offline/addBook')
        this.$store.dispatch('offline/addBook', this.book._id)
      }
    },
  },
}
</script>
<style scoped>
.v-chip {
  border-radius: 5px;
  font-size: 12px;
  height: 22px;
  margin-bottom: 4px;
}
.v-avatar {
  height: 72px !important;
  width: 72px !important;
  border-radius: unset;
  cursor: pointer;
}
.v-avatar .v-icon {
  align-self: flex-end;
}
.v-list-item-content {
  cursor: pointer;
}
.v-icon.mdi::before {
  position: absolute;
  top: 2px;
  right: 2px;
}
</style>
