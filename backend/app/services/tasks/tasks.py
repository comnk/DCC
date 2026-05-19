from fastapi import HTTPException

from ...models.task import TaskCreate, TaskUpdate
from ...db.supabase import create_supabase_client_with_token
from ...utils.extract_token import extract_token

def create_task_service(post_id: int, task_data: TaskCreate, token: str):
    _, user_id = extract_token(token)
    supabase = create_supabase_client_with_token(token)

    response = supabase.table("post_tasks").insert({
        "post_id": post_id,
        **task_data.model_dump(mode="json", exclude_none=True),
    }).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return response.data[0]

<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 73e21ee (starter tasks component for posts)
=======
>>>>>>> 88da3ae (second version of tasks system)
def get_tasks_service(post_id: int, token: str):
    _, _ = extract_token(token)
    supabase = create_supabase_client_with_token(token)

    response = supabase.table("post_tasks").select(
        "*"
    ).eq("post_id", post_id).order("created_at").execute()

    return response.data or []


def update_task_service(task_id: int, task_data: TaskUpdate, token: str):
    _, _ = extract_token(token)
    supabase = create_supabase_client_with_token(token)

    updates = task_data.model_dump(mode="json", exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.table("post_tasks").update(updates).eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return response.data[0]


def complete_task_service(task_id: int, token: str):
    _, _ = extract_token(token)
    supabase = create_supabase_client_with_token(token)

    response = supabase.table("post_tasks").update(
        {"status": "done"}
    ).eq("id", task_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    post_id = response.data[0]["post_id"]
    all_tasks = supabase.table("post_tasks").select("status").eq("post_id", post_id).execute()
    all_done = all(t["status"] == "done" for t in (all_tasks.data or []))

    return {"task": response.data[0], "all_tasks_done": all_done}


def delete_task_service(task_id: int, token: str):
    _, _ = extract_token(token)
    supabase = create_supabase_client_with_token(token)

    supabase.table("post_tasks").delete().eq("id", task_id).execute()
    return {"message": "Task deleted"}


def get_tasks_by_role_service(token: str):
    _, user_id = extract_token(token)
    supabase = create_supabase_client_with_token(token)

    response = supabase.table("post_tasks").select(
        "*, posts(id, title, campaign_id, campaigns(name))"
    ).neq("status", "done").order("due_date").execute()

    grouped: dict = {}
    for task in (response.data or []):
        role = task.get("assigned_role") or "Unassigned"
        if role not in grouped:
            grouped[role] = []
        grouped[role].append(task)

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 88da3ae (second version of tasks system)
    return grouped

def get_my_tasks_service(token: str):
    _, user_id = extract_token(token)
    supabase = create_supabase_client_with_token(token)

    response = supabase.table("post_tasks") \
        .select("*, posts(id, title, campaign_id, campaigns(name))") \
        .eq("assigned_user_id", user_id) \
        .neq("status", "done") \
        .order("due_date") \
        .execute()

<<<<<<< HEAD
    return response.data or []
=======
    return grouped
>>>>>>> 73e21ee (starter tasks component for posts)
=======
    return response.data or []
>>>>>>> 88da3ae (second version of tasks system)
