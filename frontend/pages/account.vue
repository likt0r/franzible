<template>
	<v-container fluid fill-height>
		<v-layout align-center justify-center>
			<v-flex xs12 sm8 md4>
				<v-card class="px-4">
					<v-card-text>
						<v-form
							ref="registerForm"
							v-model="valid"
							lazy-validation
							:disabled="updating"
						>
							<v-row>
								<v-col cols="12">
									<v-text-field
										v-model="user.email"
										:rules="emailRules"
										label="E-mail"
										required
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										v-model="user.password"
										:append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
										:rules="[rules.min]"
										:type="show1 ? 'text' : 'password'"
										name="input-10-1"
										label="Password"
										hint="At least 8 characters"
										counter
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										v-model="user.retyped"
										block
										:append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
										:rules="[passwordMatch]"
										:type="show1 ? 'text' : 'password'"
										name="input-10-1"
										label="Confirm Password"
										counter
									></v-text-field>
								</v-col>
								<v-spacer></v-spacer>
								<v-col class="d-flex ml-auto" cols="12">
									<v-btn
										x-large
										block
										:disabled="!valid"
										:loading="updating"
										@click="update"
									>
										Update
									</v-btn>
								</v-col>
							</v-row>
						</v-form>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	layout: 'default',
	transition: 'slide-left',

	data() {
		return {
			updating: false,
			user: {
				email: '',
				password: '',
				retyped: '',
			},
			valid: true,
			show1: false,
			emailRules: [
				(v) => !!v || 'Required',
				(v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
			],
			rules: {
				required: (value) => !!value || 'Required.',
				min: (v) =>
					(v && (v.length >= 8 || v.length === 0)) ||
					!v ||
					'Min 8 characters',
			},
		}
	},
	computed: {
		passwordMatch() {
			return (v) =>
				this.user.password === this.user.retyped || 'Password must match'
		},
	},
	mounted() {
		const { email } = this.$store.state.auth.user
		this.user.email = email
	},
	methods: {
		async userLogin() {
			try {
				await this.$auth.loginWith('local', {
					data: this.login,
				})
				// TODO: Maybe add User
			} catch (err) {
				console.log(err)
			}
		},
		async update() {
			if (this.user.password === '') {
				delete this.user.password
			}
			this.updating = true
			await this.$store.dispatch(
				'auth/patchUser',

				this.user
			)
			this.user.password = ''
			this.user.retyped = ''
			this.updating = false
		},
		reset() {
			this.$refs.form.reset()
		},
		resetValidation() {
			this.$refs.form.resetValidation()
		},
	},
}
</script>

<style></style>
