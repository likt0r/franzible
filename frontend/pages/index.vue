<template>
  <section color="black">
    <v-list subheader two-line color="black">
      <transition-group name="list">
        <book-list-entry v-for="book in books" :key="book._id" :book="book">
        </book-list-entry>
      </transition-group>
    </v-list>

    <v-skeleton-loader
      v-if="requestPending"
      :type="sekletonString"
    ></v-skeleton-loader>
  </section>
</template>

<script>
import { CookieStorage } from 'cookie-storage'
import BookListEntry from '~/components/BookListEntry.vue'
const cookieStorage = new CookieStorage()
export default {
  mixins: [],
  layout: 'default',
  transition: 'slide-right',
  components: { BookListEntry },
  data() {
    return {
      sekletonString: [...Array(3).keys()]
        .map(() => {
          return 'list-item-avatar-two-line'
        })
        .join(','),
      books: [],
      requestThrottle: null,
      requestPending: false,
    }
  },
  computed: {
    booksParams() {
      return { query: {} } // Step 3
    },
    isPending() {
      return false
    },
    searchTerm() {
      return this.$store.state.searchTerm
    },
  },
  watch: {
    searchTerm(val) {
      console.log('searchTerm changed', val)
      if (this.requestThrottle) {
        clearTimeout(this.requestThrottle)
      }
      this.books = []
      this.requestThrottle = setTimeout(() => {
        this.requestSearch()
      }, 800)
    },
  },
  methods: {
    async requestSearch() {
      console.log('requestSearch', this.searchTerm)
      const response = await this.$axios('/api/search', {
        method: 'get',
        headers: {
          Authorization: `Bearer ${cookieStorage.getItem('feathers-jwt')}`,
        },
        params: {
          term: this.searchTerm,
        },
      })
      console.log(response)
      this.books = this.books.concat(response.data)
    },
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
