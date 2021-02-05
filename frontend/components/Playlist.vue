<template>
  <FeathersVuexGet
    :id="id"
    v-slot="{ item: book }"
    service="books"
    :watch="[id]"
  >
    <v-list v-if="book">
      <v-list-item>
        <v-list-item-avatar tile>
          <v-img
            :alt="`${book.title} cover image`"
            :src="getFullUrl(book.cover)"
          ></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title v-text="book.title"></v-list-item-title>
          <v-list-item-subtitle v-text="book.author"></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-for="file in book.files" :key="file.filename">
        <v-list-item-title>{{ file.filename }} </v-list-item-title>
        <v-list-item-action>
          {{ toMinutesAndSeconds(file.duration) }}
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </FeathersVuexGet>
</template>

<script>
import { getFullUrl } from '../tools/url'
export default {
  computed: {
    id() {
      return this.$route.params.id
    },
  },
  data() {
    return {}
  },
  methods: {
    pad(num, size) {
      const s = '000000000' + num
      return s.substr(s.length - size)
    },

    toMinutesAndSeconds(time) {
      const all = Math.abs(Math.round(time))
      const seconds = all % 60
      const minutes = (all - seconds) / 60
      return `${Math.sign(time) < 0 ? '-' : ''}${this.pad(
        minutes,
        2
      )}:${this.pad(seconds, 2)}`
    },
    getFullUrl,
  },
}
</script>

<style></style>
