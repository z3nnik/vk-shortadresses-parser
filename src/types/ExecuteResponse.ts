export interface ExecuteSuccessfulResponse {
    screen_name: string,
    is_free: boolean,
    object_id?: number,
    type?: string
}

export interface ExecuteResponse {
    response?: ExecuteSuccessfulResponse[],
    error?: object
}
