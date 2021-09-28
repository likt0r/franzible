<template>
	<main class="page page--table">
		<v-data-table
			:headers="tableHeaders"
			:items="value"
			item-key="id"
			:show-select="false"
			:disable-pagination="true"
			:hide-default-footer="true"
			class="page__table"
		>
			<template v-slot:body="props">
				<draggable :list="value" tag="tbody">
					<tr v-for="(file, index) in value" :key="file._id">
						<td>
							<v-icon small class="page__grab-icon">
								mdi-arrow-all
							</v-icon>
						</td>
						<td>{{ file.filename }}</td>
						<td>
							<v-icon small @click="moveUp(file._id)" class="mr-2">
								mdi-transfer-up
							</v-icon>
							<v-icon small @click="moveDown(file._id)" class="mr-2">
								mdi-transfer-down
							</v-icon>
							<v-icon small @click="remove(file._id)">
								mdi-delete
							</v-icon>
						</td>
					</tr>
				</draggable>
			</template>
		</v-data-table>
	</main>
</template>

<script lang="js">

import Draggable from 'vuedraggable'

export default  {
	components: {
		Draggable,
	},

	props: {
		value: {
			type: Array,
			default: () => [],
		},
		label: {
			type: String,
		},
	},
	data: () => {
		return { tableHeaders: [
        { text: '', sortable: false },
		{ text: 'File name', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
	]}
	},
	computed: {},

	methods: {
        remove(id) {
            /*eslint-disable */


            const index = this.value.findIndex((el) => el._id === id)


        },
        moveUp(id){
             const index = this.value.findIndex((el) => el._id === id)
             const el = this.value[index]
             this.value.splice(index,1)
             this.value.unshift(el)
        },
        moveDown(id){
             const index = this.value.findIndex((el) => el._id === id)
             const el = this.value[index]
             this.value.splice(index,1)
             this.value.push(el)
        }
    },
}
</script>

<style lang="scss">
.page--table {
	.page {
		&__table {
			margin-top: 20px;
		}
		&__grab-icon {
			cursor: move;
		}
	}
}
</style>
