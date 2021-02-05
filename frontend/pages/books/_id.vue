<template>
  <FeathersVuexGet
    :id="id"
    v-slot="{ item: book }"
    service="books"
    :watch="[id]"
  >
    <v-container v-if="book">
      <v-row justify="center" class="pt-0">
        <v-col xs="12" sm="10" md="8" lg="6" class="pa-0">
          <v-card v-if="book" class="mx-auto">
            <v-card-text>
              <v-img :src="getFullUrl(book.cover)" :aspect-ratio="4 / 4">
              </v-img>
            </v-card-text>
            <v-card-subtitle class="pb-4 text-center">
              {{ book.files[0].filename }}
            </v-card-subtitle>
            <v-card-text
              ><v-progress-linear rounded value="100"></v-progress-linear>
            </v-card-text>
            <v-card-text class="pt-0">
              <v-row class="pt-0">
                <v-col class="text-left" :cols="3">00:23</v-col>

                <v-col class="text-center" :cols="6"
                  >Restzeit des hörspiels</v-col
                >

                <v-col class="text-right" :cols="3">-00:23</v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn fab medium dark>
                <v-icon medium>mdi-skip-previous-outline</v-icon>
              </v-btn>

              <v-btn fab medium dark>
                <v-icon medium>mdi-rewind-30</v-icon>
              </v-btn>

              <v-btn fab x-large dark>
                <v-icon medium>mdi-play-circle-outline</v-icon>
              </v-btn>

              <v-btn fab medium dark>
                <v-icon medium>mdi-fast-forward-30</v-icon>
              </v-btn>

              <v-btn fab medium dark>
                <v-icon medium>mdi-skip-next-outline</v-icon>
              </v-btn>

              <v-spacer></v-spacer>
            </v-card-actions>
            <v-card-actions>
              <v-btn>
                <span class="pa-2">Speed</span>
                <span class="pa-1">1.00X</span>
              </v-btn>

              <v-btn @click.stop="toggleChapterList">
                <span class="pa-2">Chapter</span>
                <v-icon>mdi-format-list-numbered-rtl</v-icon>
              </v-btn>

              <v-btn>
                <span class="pa-2">Sleep timer</span>

                <v-icon>mdi-timer-outline</v-icon>
              </v-btn></v-card-actions
            >
          </v-card>
        </v-col>
      </v-row>
      <v-row justify="space-around"> </v-row>
    </v-container>
  </FeathersVuexGet>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getFullUrl } from '../../tools/url'
export default {
  layout: 'player',
  computed: {
    ...mapGetters(['chapterListState']),
    id() {
      return this.$route.params.id
    },
  },

  methods: {
    ...mapActions(['toggleChapterList']),
    doSomething() {
      console.log('done')
      console.log('done')
    },
    getFullUrl,
  },
}
</script>
