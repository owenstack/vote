import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Button } from "@vote/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@vote/ui/components/card";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@vote/ui/components/combobox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@vote/ui/components/field";
import {
	Item,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from "@vote/ui/components/item";
import { Logo } from "@vote/ui/components/logo";
import { useLocalStorage } from "usehooks-ts";
import z from "zod";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/login")({
	beforeLoad: () => {
		const slug = localStorage.getItem("org:slug");
		if (slug) {
			throw redirect({
				to: "/$slug/login",
				params: {
					slug,
				},
			});
		}
	},
	loader: async () => {
		const initialData = await client.user.misc.getOrgs();
		return { initialData };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const formSchema = z.object({
		slug: z.string().min(1, { message: "Slug is required" }),
	});
	const navigate = useNavigate({ from: Route.id });
	const [_, setSlug] = useLocalStorage("org:slug", "");
	const { initialData } = Route.useLoaderData();
	const { data: orgs } = useQuery(
		orpc.user.misc.getOrgs.queryOptions({
			initialData,
		}),
	);
	type Org = (typeof orgs)[0];
	const form = useForm({
		defaultValues: {
			slug: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: ({ value }) => {
			setSlug(value.slug);
			navigate({ to: "/$slug/login", params: { slug: value.slug } });
		},
	});
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Logo />
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Welcome back</CardTitle>
						<CardDescription>Choose your university</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							<FieldGroup>
								<form.Field name="slug">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel>University</FieldLabel>
												<Combobox
													items={orgs}
													itemToStringValue={(org) => (org as Org).name}
												>
													<ComboboxInput
														aria-invalid={isInvalid}
														placeholder="Choose your university"
													/>
													<ComboboxContent>
														<ComboboxEmpty>No universities found</ComboboxEmpty>
														<ComboboxList>
															{(org: Org) => (
																<ComboboxItem key={org.id} value={org.slug}>
																	<Item>
																		<ItemMedia variant="image">
																			<img
																				className="aspect-square size-6"
																				src={org.logo ?? "/logo.png"}
																				alt={org.name}
																			/>
																		</ItemMedia>
																		<ItemContent>
																			<ItemTitle>{org.name}</ItemTitle>
																		</ItemContent>
																	</Item>
																</ComboboxItem>
															)}
														</ComboboxList>
													</ComboboxContent>
												</Combobox>
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
			</div>
		</div>
	);
}
