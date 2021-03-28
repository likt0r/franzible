<template>
  <section color="black">
    <v-list ref="books" subheader two-line color="black">
      <transition-group name="list">
        <book-list-entry v-for="book in books" :key="book._id" :book="book">
        </book-list-entry>
      </transition-group>
    </v-list>

    <div class="spacer"></div>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import BookListEntry from '~/components/BookListEntry.vue'
import { getDatabase } from '~/tools/database'
export default {
  components: { BookListEntry },
  mixins: [],
  layout: 'default',
  transition: 'slide-right',
  data() {
    return {}
  },
  computed: {
    books() {
      return this.$store.state.offline.books
    },
  },
  async mounted() {},
  beforeDestroy() {},
  methods: {},
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
.spacer {
  height: 72px;
}
</style>
