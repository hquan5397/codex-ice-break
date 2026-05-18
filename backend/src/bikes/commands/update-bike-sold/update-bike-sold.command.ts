export class UpdateBikeSoldCommand {
  constructor(
    public readonly id: string,
    public readonly sold: boolean,
  ) {}
}
