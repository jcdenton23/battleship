import { SessionId, User, UserIdentifier } from '../types';

class UserModel {
  private static instance: UserModel;
  private users: Map<UserIdentifier, User>;

  private constructor() {
    this.users = new Map<UserIdentifier, User>();
  }

  public static getInstance(): UserModel {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel();
    }
    return UserModel.instance;
  }

  private getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public findUserByName(name: string): User | undefined {
    return this.getAllUsers().find((user) => user.name === name);
  }

  public findUserBySessionId(sessionId: SessionId): User | undefined {
    return this.getAllUsers().find((user) => user.sessionId === sessionId);
  }

  public addUser(userId: UserIdentifier, user: User): void {
    this.users.set(userId, user);
  }

  public getUser(userId: UserIdentifier): User | undefined {
    return this.users.get(userId);
  }

  public hasUser(userId: UserIdentifier): boolean {
    return this.users.has(userId);
  }

  public authenticateUser(name: string, password: string): boolean {
    const user = this.findUserByName(name);
    return user !== undefined && user.password === password;
  }

  public updateUserSession(
    name: string,
    sessionId: SessionId
  ): UserIdentifier | undefined {
    const user = this.findUserByName(name);
    if (!user) {
      return;
    }
    const updatedUser = { ...user, sessionId };
    this.users.set(user.id, updatedUser);
    return user.id;
  }
}

export const userModel = UserModel.getInstance();
