<template>
  <v-list-item>
    <v-list-item-avatar tile>
      <v-img
        :alt="`${book.title} cover image`"
        :src="book.cover ? getFullUrl(book.cover) : '/icon.png'"
      ></v-img>
    </v-list-item-avatar>

    <v-list-item-content>
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
export default {
  props: {
    book: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
