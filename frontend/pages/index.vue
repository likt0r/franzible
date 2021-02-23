<template>
  <FeathersVuexFind
    v-slot="{ items: books }"
    service="books"
    :params="{ query: {} }"
    watch="query"
  >
    <section color="black">
      <v-list subheader two-line color="black">
        <v-list-item
          v-for="book in books.filter((book) => book.files.length > 0)"
          :key="book._id"
          :to="`/books/${book._id}`"
        >
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
      </v-list>
    </section>
  </FeathersVuexFind>
</template>

<script>
import { getFullUrl } from '../tools/url'
export default {
  layout: 'default',
  methods: {
    doSomething() {
      console.log('done')
      console.log('done')
    },
    getFullUrl,
  },
}
</script>
