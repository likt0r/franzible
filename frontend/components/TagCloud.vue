<template>
	<v-card
		:class="`tag-cloud mx-auto ${error ? ' error--text pa-2' : ''}`"
		elevation="0"
		flat
		tile
		outlined
		color="transparent"
	>
		<v-card-title v-if="label" class="pa-0">
			{{ label }}
		</v-card-title>
		<v-card-text v-if="value.length > 0" class="pa-0">
			<v-chip-group column>
				<v-chip
					v-for="(item, index) in value"
					:key="item"
					close
					label
					color="#13202a"
					close-icon="mdi-close"
					@click:close="remove(index)"
				>
					{{ item }}
				</v-chip>
				<v-chip
					close
					label
					color="secondary"
					dark
					close-icon="mdi-plus"
					@click:close="addValue"
				>
					<v-text-field
						class="mb-4"
						v-model="newValue"
						:label="`Add ${addLabel}`"
						hide-details="auto"
					></v-text-field>
				</v-chip>
			</v-chip-group>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	props: {
		value: {
			type: Array,
			default: () => [],
		},
		label: {
			type: String,
		},
		addLabel: { type: String },
		error: {
			type: Boolean,
		},
	},
	data: () => {
		return {
			newValue: '',
		}
	},
	computed: {},

	methods: {
		remove(index) {
			const tmp = [...this.value]
			tmp.splice(index, 1)
			this.$emit('input', tmp)
		},
		addValue() {
			if (this.newValue !== '') {
				this.$emit('input', [...this.value, this.newValue])
				this.newValue = ''
			}
		},
	},
}
</script>

<style scoped>
.v-card__title {
	letter-spacing: normal;
	color: rgb(133, 133, 133);
	font-size: 16px;
	line-height: 20px;
	font-family: 'Roboto', sans-serif;
}
</style>
