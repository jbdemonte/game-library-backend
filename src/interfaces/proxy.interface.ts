export interface IProxy {
  host: string,
  port: number,
  type: string,
  country: string,
  speed: number | null,
  availability: number | null,
  ping: number | null
}
