export interface HelloWorldInput {
  name?: string | null;
}

export interface HelloWorldResult {
  normalizedName: string;
  message: string;
}

export interface HelloWorldResponse {
  status: "ok";
  data: HelloWorldResult;
}
