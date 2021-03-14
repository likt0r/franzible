<template>
  <v-list-item :to="`/books/${book._id}`">
    <v-list-item-avatar tile>
      <v-img
        :alt="`${book.title} cover image`"
        :src="book.cover ? getFullUrl(book.cover) : '/icon.png'"
      ></v-img>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title v-if="book.series.length > 0"
        ><v-chip
          class="mr-2"
          color="#13202a"
          small
          v-for="serie in book.series"
          :key="serie"
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
import { getFullUrl } from '../tools/url'
export default {
  props: {
    book: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    getFullUrl,
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
</style>
