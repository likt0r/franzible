<template>
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

      <v-card-text>
        <audio controls :src="getFullUrl(book.files[0].filepath)">
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
