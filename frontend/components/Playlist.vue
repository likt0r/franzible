<template>
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
		<v-list-item-group :value="activeFileIndex">
			<v-list-item
				v-for="(file, index) in book.files"
				:key="file.filename"
				:class="'active'"
				@click.stop="playFile(index)"
			>
				<v-list-item-title>{{ file.filename }} </v-list-item-title>
				<v-list-item-action>
					{{ toMinutesAndSeconds(file.duration) }}
				</v-list-item-action>
			</v-list-item>
		</v-list-item-group>
	</v-list>
</template>

<script>
import { getFullUrl } from '../tools/url'
import { toMinutesAndSeconds } from '../tools/formatTime'
export default {
	data() {
		return {}
	},
	computed: {
		id() {
			return this.$route.params.id
		},
		activeBookId() {
			return this.$store.getters['player/activeBookId']
		},
		activeFileIndex() {
			return this.activeBookId === this.id
				? this.$store.getters['player/activeFileIndex']
				: null
		},
		book() {
			return this.$store.getters['book/getBook'](this.$route.params.id)
		},
	},
	methods: {
		playFile(index) {
			this.$store.dispatch('player/loadFile', {
				bookId: this.id,
				fileIndex: index,
				startPlaying: true,
			})
		},
		toMinutesAndSeconds,
		getFullUrl,
	},
}
</script>

<style></style>
