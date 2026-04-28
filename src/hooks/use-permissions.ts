import { useAuth } from './use-auth';

export function usePermissions() {
    const { user } = useAuth();

    const can = (permission: string) =>
        user?.permissions?.includes(permission) ?? false;

    const isAdmin = () => user?.roles?.includes('admin') ?? false;

    return { can, isAdmin };
}

// Usage in a component:
// const { can } = usePermissions();
// {can('documents:delete') && <DeleteButton />}