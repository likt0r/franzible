<template>
  <FeathersVuexFind
    v-slot="{ items: books }"
    service="books"
    :params="{ query: {} }"
    watch="query"
  >
    <section>
      <v-list subheader two-line>
        <v-list-item
          v-for="book in books"
          :key="book._id"
          :to="`/books/${book._id}`"
        >
          <v-list-item-avatar tile>
            <v-img
              v-if="book.cover"
              :alt="`${book.title} cover image`"
              :src="getFullUrl(book.cover)"
            ></v-img>
            <v-icon v-else x-large>mdi-image-area</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="book.title"></v-list-item-title>
            <v-list-item-subtitle v-text="book.author"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon color="grey lighten-1">mdi-play</v-icon>
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
