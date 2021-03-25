<template>
  <v-list-item>
    <v-list-item-avatar tile @click="toggleDownload">
      <v-img
        :alt="`${book.title} cover image`"
        :src="book.cover ? getFullUrl(book.cover) : '/icon.png'"
      >
        <v-spacer />
        <v-icon small>mdi-download</v-icon>
      </v-img>
    </v-list-item-avatar>

    <v-list-item-content :to="`/books/${book._id}`">
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
      <v-btn icon>
        <v-icon color="secondary">mdi-play</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script>
import { getFullUrl } from '~/tools/url'
import { getDatabase } from '~/tools/database'
export default {
  props: {
    book: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    getFullUrl,
    toggleDownload() {
      const db = getDatabase()
      console.log('Book clicked ', this.book)
      db.addBook(this.book)
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
}
.v-avatar .v-icon {
  align-self: flex-end;
}
</style>
