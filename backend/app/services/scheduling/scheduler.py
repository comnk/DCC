from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

def initialize_scheduler():
    scheduler.start()
    return scheduler