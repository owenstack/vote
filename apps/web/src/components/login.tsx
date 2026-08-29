import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@vote/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@vote/ui/components/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@vote/ui/components/field";
import { Input } from "@vote/ui/components/input";
import { toast } from "sonner";
import z from "zod";
import { organization, signIn } from "@/lib/auth";
import { orpc } from "@/lib/orpc";

const formSchema = z.object({
	email: z.email(),
	password: z
		.string({ error: "Password is required" })
		.min(8, { error: "Minimum length of 8 characters is required" }),
	rememberMe: z.boolean(),
});

export function Login({ to }: { to: `/${string}` }) {
	const navigate = useNavigate();
	const { data: orgs } = useQuery(orpc.user.misc.getOrgs.queryOptions());
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const { email, password, rememberMe } = value;
			toast.promise(
				async () => {
					const { error } = await signIn.email({ email, password, rememberMe });
					if (error) return toast.error(error.message);
					if (to !== "/admin") {
						const chosenOrg = orgs?.find((org) => org.slug === to.slice(1));
						if (!chosenOrg) return toast.error("Organization not found");
						const { slug: organizationSlug, id: organizationId } = chosenOrg;
						const { error: setActiveError } = await organization.setActive({
							organizationId,
							organizationSlug,
						});
						if (setActiveError) return toast.error(setActiveError.message);
						navigate({ to: to as string });
					}
				},
				{
					loading: "Signing in...",
					success: "Signed in successfully!",
					error: (err) => {
						return err instanceof Error ? err.message : "Internal server error";
					},
				},
			);
		},
	});

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Welcome back</CardTitle>
				<CardDescription>Please sign in to your account</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<form.Field name="email">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>Email address</FieldLabel>
										<Input
											type="email"
											autoComplete="email"
											id={field.name}
											name={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
						<form.Field name="password">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>Password</FieldLabel>
										<Input
											type="password"
											autoComplete="current-password"
											id={field.name}
											name={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
						<form.Subscribe>
							{({ isDirty, isSubmitting }) =>
								isDirty && (
									<Button type="submit" disabled={isSubmitting}>
										Submit
									</Button>
								)
							}
						</form.Subscribe>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
