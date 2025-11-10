#pragma once

#include "main/lbug.h"
#include "main/storage_driver.h"
using namespace lbug::main;


class WebDatabase {
    friend class WebConnection;

public:

    static std::string getVersion();

    static uint64_t getStorageVersion();

    explicit WebDatabase(const std::string& databasePath, uint64_t bufferPoolSize,
        uint64_t maxNumThreads, bool compression, bool readOnly, uint64_t maxDBSize);

    ~WebDatabase();
    void close();
private:
    std::unique_ptr<Database> database;
    std::unique_ptr<StorageDriver> storageDriver;
};

