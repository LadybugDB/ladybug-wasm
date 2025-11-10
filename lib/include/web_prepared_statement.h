#pragma once

#include "main/lbug.h"
#include "main/prepared_statement.h"

using namespace lbug::main;

class WebPreparedStatement {
    friend class WebConnection;

public:

    std::string getErrorMessage() const;

    bool isSuccess() const;

private:
    std::unique_ptr<PreparedStatement> preparedStatement;
};
