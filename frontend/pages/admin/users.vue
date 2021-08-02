<template>
	<v-container>
		<v-row justify="center" align="start">
			<v-col xs="12" sm="12" md="10" lg="10">
				<v-data-table
					:headers="headers"
					:items="users"
					sort-by="calories"
					class="elevation-1"
				>
					<template #top>
						<v-toolbar flat>
							<v-toolbar-title>Users</v-toolbar-title>
							<v-divider class="mx-4" inset vertical></v-divider>
							<v-spacer></v-spacer>
							<v-dialog v-model="dialog" max-width="500px">
								<template #activator="{ on, attrs }">
									<v-btn
										color="primary"
										dark
										class="mb-2"
										v-bind="attrs"
										v-on="on"
									>
										New User
									</v-btn>
								</template>
								<v-card>
									<v-card-title>
										<span class="headline">{{ formTitle }}</span>
									</v-card-title>

									<v-card-text>
										<v-container>
											<v-row>
												<v-col cols="12" sm="6" md="4">
													<v-text-field
														v-model="editedItem.email"
														label="Email"
														type="email"
													></v-text-field>
												</v-col> </v-row
											><v-row>
												<v-col cols="12" sm="6" md="4">
													<v-text-field
														v-model="editedItem.password"
														label="Password"
													></v-text-field>
												</v-col>
												<v-col cols="12" sm="6" md="4">
													<v-text-field
														v-model="editedItem.retyped"
														label="Retype"
													></v-text-field>
												</v-col> </v-row
											><v-row>
												<v-col cols="12" sm="6" md="4">
													<v-checkbox
														v-model="editedItem.isAdmin"
														label="Administrator"
													></v-checkbox>
												</v-col>
											</v-row>
										</v-container>
									</v-card-text>

									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn color="blue darken-1" text @click="close">
											Cancel
										</v-btn>
										<v-btn
											color="blue darken-1"
											text
											:disabled="!valid"
											:loading="loading"
											@click="save"
										>
											Save
										</v-btn>
									</v-card-actions>
								</v-card>
							</v-dialog>
							<v-dialog v-model="dialogDelete" max-width="500px">
								<v-card>
									<v-card-title class="headline"
										>User: {{ editedItem.email }}</v-card-title
									>
									<v-card-text class="headline"
										>Are you sure you want to delete this
										user?</v-card-text
									>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn color="blue darken-1" text @click="close"
											>Cancel</v-btn
										>
										<v-btn
											color="blue darken-1"
											text
											:loading="loading"
											@click="deleteItemConfirm"
											>OK</v-btn
										>
										<v-spacer></v-spacer>
									</v-card-actions>
								</v-card>
							</v-dialog>
						</v-toolbar>
					</template>
					<template #item.actions="{ item }">
						<v-icon small class="mr-2" @click="editItem(item)">
							mdi-pencil
						</v-icon>
						<v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
					</template>
				</v-data-table>
			</v-col></v-row
		>
	</v-container>
</template>

<script>
import { getFullUrl } from '~/tools/url'

export default {
	layout: 'default',
	middleware: 'admin',
	data: () => {
		return {
			loading: false,
			dialog: false,
			dialogDelete: false,
			headers: [
				{
					text: 'Email',
					align: 'start',
					sortable: true,
					value: 'email',
				},
				{ text: 'Administrator', value: 'isAdmin' },
				{ text: 'Actions', value: 'actions', sortable: false },
			],
			editedIndex: -1,
			editedItem: {
				email: '',
				isAdmin: false,
				password: '',
				retyped: '',
			},
			defaultItem: {
				email: '',
				isAdmin: false,
				password: '',
				retyped: '',
			},
		}
	},
	computed: {
		usersParams() {
			return { query: {} } // Step 3
		},
		formTitle() {
			return this.editedIndex === -1 ? 'New User' : 'Edit User'
		},
		valid() {
			return (
				this.editedIndex >= 0 ||
				(this.editedItem.password === this.editedItem.retyped &&
					this.editedIndex === -1 &&
					this.editedItem.password !== '')
			)
		},
	},

	watch: {},
	methods: {
		editItem(item) {
			this.editedIndex = this.users.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.dialog = true
		},

		deleteItem(item) {
			this.editedIndex = this.users.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.dialogDelete = true
		},

		deleteItemConfirm() {
			this.closeDelete()
		},

		close() {
			this.dialog = false
			this.dialogDelete = false
			this.$nextTick(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
			})
		},

		async closeDelete() {
			console.log('closeDelete')
			this.loading = true
			try {
				await this.$store.dispatch('users/remove', this.editedItem._id)
				this.loading = false
				this.dialogDelete = false
				this.$nextTick(() => {
					this.editedItem = Object.assign({}, this.defaultItem)
					this.editedIndex = -1
				})
			} catch (error) {
				this.loading = false
			}
		},

		async save() {
			this.loading = true
			if (this.editedIndex > -1) {
				if (this.editedItem.password === '') {
					delete this.editedItem.password
				}
				console.log('patch item', this.editedItem)
				await this.$store.dispatch('users/patch', [
					this.editedItem._id,
					this.editedItem,
				])
			} else {
				await this.$store.dispatch('users/create', this.editedItem)
			}
			this.loading = false
			this.close()
		},
		getFullUrl,
	},
}
</script>
