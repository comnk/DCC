from fastapi import APIRouter, Header

from ..models.task import TaskCreate, TaskUpdate

from ..services.tasks.tasks import (
    create_task_service,
    get_tasks_service,
    update_task_service,
    complete_task_service,
    delete_task_service,
    get_tasks_by_role_service,
    get_my_tasks_service,
)

post_tasks_router = APIRouter(prefix="/posts", tags=["tasks"])
tasks_router = APIRouter(prefix="/tasks", tags=["tasks"])


@tasks_router.get("/my-tasks")
def get_my_tasks(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return get_my_tasks_service(token)

@tasks_router.get("/by-role")
def get_tasks_by_role(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return get_tasks_by_role_service(token)

@post_tasks_router.post("/{post_id}/tasks")
def create_task(post_id: int, task: TaskCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return create_task_service(post_id, task, token)

@post_tasks_router.get("/{post_id}/tasks")
def get_tasks(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return get_tasks_service(post_id, token)

@tasks_router.get("/by-role")
def get_tasks_by_role(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return get_tasks_by_role_service(token)

@tasks_router.patch("/{task_id}")
def update_task(task_id: int, task: TaskUpdate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return update_task_service(task_id, task, token)


@tasks_router.post("/{task_id}/complete")
def complete_task(task_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return complete_task_service(task_id, token)


@tasks_router.delete("/{task_id}")
def delete_task(task_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return delete_task_service(task_id, token)