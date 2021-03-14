<template>
  <section color="black">
    <v-list ref="books" subheader two-line color="black">
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
  components: { BookListEntry },
  mixins: [],
  layout: 'default',
  transition: 'slide-right',
  data() {
    return {
      sekletonString: [...Array(3).keys()]
        .map(() => {
          return 'list-item-avatar-two-line'
        })
        .join(','),
      books: [],
      skip: 0,
      limit: 15,
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
      this.skip = 0
      this.requestThrottle = setTimeout(() => {
        this.requestSearch()
      }, 800)
    },
  },
  mounted() {
    // init endless scroll listener
    this.$nextTick(function () {
      window.addEventListener('scroll', this.onScroll, {
        passive: true,
      })
      this.onScroll() // needed for initial loading on page
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
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
          $skip: this.skip,
          $limit: this.limit,
        },
      })
      console.log('response length', response.data.length)
      console.log(response)
      if (response.data.length > 0) {
        this.books = this.books.concat(response.data)
        this.skip = this.skip + this.limit
        console.log('books length', this.books.length)
      }
    },
    onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement

      if (scrollTop + clientHeight >= scrollHeight - 5) {
        this.requestSearch()
      }
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
