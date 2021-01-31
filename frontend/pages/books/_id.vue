<template>
  <!-- <v-list subheader two-line>
    <v-list-item v-for="book in books" :key="book._id">
      <v-list-item-avatar>
        <v-img :alt="`${book.title} cover image`"></v-img>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title v-text="book.title"></v-list-item-title>
        <v-list-item-subtitle v-text="book.author"></v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-btn icon @click="doSomething(book)">
          <v-icon color="grey lighten-1">mdi-play</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
  </v-list> -->
  <FeathersVuexGet
    :id="id"
    v-slot="{ item: book }"
    service="books"
    :watch="[id]"
  >
    <v-card class="mx-auto" max-width="450">
      <v-img :src="getFullUrl(book.cover)" :aspect-ratio="4 / 4"> </v-img>
      <v-card-title>
        <div class="display-1 mb-2">{{ book.title }}</div>
        <div class="title font-weight-regular grey--text">
          {{ book.author }}
        </div>
      </v-card-title>

      <v-card-text
       <audio
        controls
        :src="getFullUrl(book.files[0])">
            Your browser does not support the
            <code>audio</code> element.
        </audio>
      </v-card-text>
    </v-card>
  </FeathersVuexGet>
</template>

<script>
import { getFullUrl } from '../../tools/url'
export default {
  layout: 'default',
  computed: {
    id() {
      return this.$route.params.id
    },
  },
  methods: {
    doSomething() {
      console.log('done')
      console.log('done')
    },
    getFullUrl,
  },
}
</script>
