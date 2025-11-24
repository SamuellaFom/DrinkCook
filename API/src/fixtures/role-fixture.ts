import { Role } from "../services/db/models/role";
import { TypeRole } from "../services/enums";

export const roleFixture: Partial<Role>[] = [
  {
    id: 1,
    type: TypeRole.ADMIN,
  },
  {
    id: 2,
    type: TypeRole.MANAGER,
  },
    {
    id: 3,
    type: TypeRole.EMPLOYE,
  },
]