<template>
  <section color="black">
    <v-list subheader two-line color="black">
      <transition-group name="list">
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
      </transition-group>
    </v-list>

    <v-skeleton-loader
      v-if="isFindBooksPending"
      :type="sekletonString"
    ></v-skeleton-loader>
  </section>
</template>

<script>
import { makeFindMixin } from 'feathers-vuex'
import { getFullUrl } from '../tools/url'
export default {
  mixins: [makeFindMixin({ service: 'books', watch: 'search' })],
  layout: 'default',
  transition: 'slide-right',
  data() {
    return {
      sekletonString: [...Array(3).keys()]
        .map(() => {
          return 'list-item-avatar-two-line'
        })
        .join(','),
    }
  },
  computed: {
    search() {
      return this.$store.getters.search
    },
    booksParams() {
      return {
        query: {
          search: this.search != '' ? this.search.toString() : undefined,
        },
      } // Step 3
    },
    isPending() {
      return false
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
<style scoped>
.theme--dark.v-application {
  background-color: black !important;
}
.v-skeleton-loader__list-item-avatar-two-line {
  background-color: black !important;
}
.v-skeleton-loader__avatar {
  border-radius: unset !important;
}

.list-enter-active {
  transition: all 1s;
}
.list-enter/* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
